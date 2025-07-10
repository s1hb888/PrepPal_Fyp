const express  = require('express'); 
const router   = express.Router();
const ScreenTime = require('../models/ScreenTime');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const moment   = require('moment');

const fmt = (d) => moment(d).format('DD/MM/YYYY, h:mm a');
const now = () => moment();
const num = (v) => Number(v || 0);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ───────── HELPERS ───────── */
const doDailyReset = async (rec) => {
  if (!rec.lastReset || now().isAfter(moment(rec.lastReset).endOf('day'))) {
    rec.openCountToday     = 0;
    rec.totalUsedTimeToday = 0;
    rec.isLocked           = false;
    rec.lastReset          = now().toDate();
    await rec.save();
  }
};

const autoUnlockIfGapPassed = async (rec) => {
  if (rec.isLocked && rec.lastSessionEndTime && num(rec.nextSessionGap) > 0) {
    const unlockAt = moment(rec.lastSessionEndTime).add(num(rec.nextSessionGap), 'minutes');
    if (now().isSameOrAfter(unlockAt)) {
      rec.isLocked = false;
      await rec.save();
    }
  }
};

/* ───────── START SESSION ───────── */
router.post('/start-session', async (req, res) => {
  const { userId } = req.body;
  if (!isValidId(userId))
    return res.status(400).json({ success:false, message:'Bad userId' });

  let rec = await ScreenTime.findOne({ userId });
  if (!rec) return res.status(404).json({ success:false, message:'Record not found' });

  /* 1️⃣ housekeeping */
  await doDailyReset(rec);            // midnight reset
  await autoUnlockIfGapPassed(rec);   // unlock after gap
  rec = await ScreenTime.findOne({ userId }); // reload fresh values

  /* 2️⃣ gap still running? */
  if (rec.isLocked)
    return res.status(403).json({ success:false, locked:true, message:'Waiting gap' });

  /* 3️⃣ limit checks */
  if (num(rec.dailyUsageLimit) > 0 && rec.openCountToday >= num(rec.dailyUsageLimit))
    return res.status(403).json({ success:false, locked:true, message:'Daily session limit reached' });

  if (num(rec.totalDailyTime) > 0 && rec.totalUsedTimeToday >= num(rec.totalDailyTime))
    return res.status(403).json({ success:false, locked:true, message:'Daily time limit reached' });

  /* 4️⃣ start the session */
  const start = now();
  const end   = num(rec.sessionDuration) > 0 ? start.clone().add(rec.sessionDuration, 'minutes') : null;

  rec.sessionStartTime = start.toDate();
  rec.sessionEndTime   = end ? end.toDate() : null;
  rec.startFormatted   = fmt(start);
  rec.endFormatted     = end ? fmt(end) : null;
  rec.openCountToday  += 1;

  await rec.save();

  return res.json({
    success : true,
    startISO: rec.sessionStartTime,
    endISO  : rec.sessionEndTime
  });
});

/* ───────── SAVE / UPDATE SETTINGS ───────── */
// ✅ Save route update with try-catch inside notification
router.post('/save', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidId(userId))
      return res.status(400).json({ success: false, error: 'Invalid userId' });

    const data = {};
    if (req.body.dailyUsageLimit !== undefined) data.dailyUsageLimit = num(req.body.dailyUsageLimit);
    if (req.body.sessionDuration !== undefined) data.sessionDuration = num(req.body.sessionDuration);
    if (req.body.totalDailyTime !== undefined) data.totalDailyTime = num(req.body.totalDailyTime);
    if (req.body.notificationsEnabled !== undefined) data.notificationsEnabled = !!req.body.notificationsEnabled;
    if (req.body.nextSessionGap !== undefined) data.nextSessionGap = num(req.body.nextSessionGap);

    const rec = await ScreenTime.findOneAndUpdate(
      { userId },
      {
        $set: data,
        $setOnInsert: {
          openCountToday: 0,
          totalUsedTimeToday: 0,
          isLocked: false,
          lastReset: now().toDate(),
        },
      },
      { new: true, upsert: true }
    );


    return res.json({ success: true, data: rec });

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});


/* ───────── GET STATUS ───────── */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId))
      return res.status(400).json({ success: false, error: 'Invalid userId' });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, message: 'Not found' });

    await doDailyReset(rec);
    await autoUnlockIfGapPassed(rec);

    res.json({
      success: true,
      sessionStartISO: rec.sessionStartTime,
      sessionEndISO: rec.sessionEndTime,
      data: rec.toObject(),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ───────── LOCK SESSION ───────── */
router.post('/lock-session', async (req, res) => {
  try {
    const { userId, sessionEnded = false } = req.body;
    if (!isValidId(userId))
      return res.status(400).json({ success: false, error: 'Invalid userId format' });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, message: 'Not found' });

    if (!rec.sessionStartTime)
      return res.json({ success: true, locked: rec.isLocked, message: 'No active session' });

    const mustLock =
      sessionEnded || (rec.sessionEndTime && now().isSameOrAfter(rec.sessionEndTime));

    if (!rec.sessionStartTime && mustLock && !rec.isLocked) {
      rec.isLocked = true;
      rec.lastSessionEndTime = now().toDate();
      await rec.save();
      return res.json({ success: true, locked: true, message: 'Force locked without active session' });
    }

    if (!rec.sessionStartTime)
      return res.json({ success: true, locked: rec.isLocked, message: 'No active session' });

    const minutesUsed = sessionEnded
      ? num(rec.sessionDuration)
      : Math.max(1, Math.ceil(moment().diff(moment(rec.sessionStartTime), 'minutes', true)));

    const allowed = num(rec.totalDailyTime) || Infinity;
    rec.totalUsedTimeToday = Math.min(rec.totalUsedTimeToday + minutesUsed, allowed);

    rec.lastSessionEndTime = now().toDate();
    rec.sessionStartTime = null;
    rec.sessionEndTime = null;
    rec.startFormatted = null;
    rec.endFormatted = null;
    rec.isLocked = true;

    await rec.save();


    res.json({ success: true, locked: true, message: 'Session locked' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
