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
  // Check if we need to reset (new day has started)
  const lastResetDate = rec.lastReset ? moment(rec.lastReset) : null;
  const currentDate = now();
  
  // If lastReset is null or if current time is after the end of lastReset's day
  const needsReset = !lastResetDate || currentDate.isAfter(lastResetDate.endOf('day'));
  
  if (needsReset) {
    rec.openCountToday     = 0;
    rec.totalUsedTimeToday = 0;
    rec.isLocked           = false;
    rec.sessionStartTime   = null;
    rec.sessionEndTime     = null;
    rec.lastSessionEndTime = null;
    rec.startFormatted     = null;
    rec.endFormatted       = null;
    rec.lastReset          = now().toDate();
    
    await rec.save();
  }
};

const autoUnlockIfGapPassed = async (rec) => {
  if (rec.isLocked && rec.lastSessionEndTime && num(rec.nextSessionGap) > 0) {
    const unlockAt = moment(rec.lastSessionEndTime).add(num(rec.nextSessionGap), 'minutes');
    const nowTime = now();
    
    if (nowTime.isSameOrAfter(unlockAt)) {
      
      rec.isLocked = false;
      await rec.save();
    } else {
    }
  }
};

/* ───────── START SESSION ───────── */
router.post('/start-session', async (req, res) => {
  const { userId } = req.body;

  if (!isValidId(userId)) {
    return res.status(400).json({ success:false, message:'Bad userId' });
  }

  let rec = await ScreenTime.findOne({ userId });
  if (!rec) {
    return res.status(404).json({ success:false, message:'Record not found' });
  }

  /* 1️⃣ Housekeeping */
  await doDailyReset(rec);
  await autoUnlockIfGapPassed(rec);
  rec = await ScreenTime.findOne({ userId }); // Reload fresh values

  /* 2️⃣ Check if gap is still running */
  if (rec.isLocked) {
    return res.status(403).json({ 
      success: false, 
      locked: true, 
      message: 'Waiting gap' 
    });
  }

  /* 3️⃣ Check daily limits BEFORE incrementing */
  const currentSessions = rec.openCountToday || 0;
  const allowedSessions = num(rec.dailyUsageLimit);
  const currentTime = rec.totalUsedTimeToday || 0;
  const allowedTime = num(rec.totalDailyTime);


  if (allowedSessions > 0 && currentSessions >= allowedSessions) {
    return res.status(403).json({ 
      success: false, 
      locked: true, 
      message: 'Daily session limit reached' 
    });
  }

  if (allowedTime > 0 && currentTime >= allowedTime) {
    return res.status(403).json({ 
      success: false, 
      locked: true, 
      message: 'Daily time limit reached' 
    });
  }

  /* 4️⃣ Start the session */
  const start = now();
  const end = num(rec.sessionDuration) > 0 
    ? start.clone().add(rec.sessionDuration, 'minutes') 
    : null;

  rec.sessionStartTime = start.toDate();
  rec.sessionEndTime   = end ? end.toDate() : null;
  rec.startFormatted   = fmt(start);
  rec.endFormatted     = end ? fmt(end) : null;
  rec.openCountToday  += 1;

  await rec.save();

  return res.json({
    success: true,
    startISO: rec.sessionStartTime,
    endISO: rec.sessionEndTime,
    sessionNumber: rec.openCountToday,
    remainingSessions: allowedSessions - rec.openCountToday
  });
});

/* ───────── SAVE / UPDATE SETTINGS ───────── */
router.post('/save', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidId(userId))
      return res.status(400).json({ success: false, error: 'Invalid userId' });

    const daily = num(req.body.dailyUsageLimit);
    const session = num(req.body.sessionDuration);
    const gap = num(req.body.nextSessionGap);
    const notify = !!req.body.notificationsEnabled;

    // Auto-calculate totalDailyTime
    const total = daily > 0 && session > 0 ? daily * session : 0;

    const data = {
      dailyUsageLimit: daily,
      sessionDuration: session,
      totalDailyTime: total,
      nextSessionGap: gap,
      notificationsEnabled: notify,
    };

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

    console.log('[⚙️ Settings Updated:', {
      dailyUsageLimit: daily,
      sessionDuration: session,
      nextSessionGap: gap,
      totalDailyTime: total
    });

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

    let rec = await ScreenTime.findOne({ userId });

    // If no record, create default WHO settings
    if (!rec) {
      rec = await ScreenTime.create({
        userId,
        dailyUsageLimit: 2,
        sessionDuration: 30,
        nextSessionGap: 60,
        totalDailyTime: 60,
        notificationsEnabled: true,
        openCountToday: 0,
        totalUsedTimeToday: 0,
        isLocked: false,
        lastReset: new Date(),
      });
    }

    await doDailyReset(rec);
    await autoUnlockIfGapPassed(rec);
    
    // Reload to get fresh data after helpers
    rec = await ScreenTime.findOne({ userId });

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
    if (!isValidId(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid userId format' });
    }

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // If no active session, nothing to lock
    if (!rec.sessionStartTime) {
      return res.json({ 
        success: true, 
        locked: rec.isLocked, 
        message: 'No active session' 
      });
    }

    // Check if session should be locked
    const mustLock = sessionEnded || 
                     (rec.sessionEndTime && now().isSameOrAfter(moment(rec.sessionEndTime)));

    if (!mustLock) {
      return res.json({ 
        success: true, 
        locked: false, 
        message: 'Session still active' 
      });
    }

    // Calculate minutes used
    const minutesUsed = sessionEnded
      ? num(rec.sessionDuration)
      : Math.max(1, Math.ceil(moment().diff(moment(rec.sessionStartTime), 'minutes', true)));

    const allowed = num(rec.totalDailyTime) || Infinity;
    rec.totalUsedTimeToday = Math.min(rec.totalUsedTimeToday + minutesUsed, allowed);

    // Lock the session
    rec.lastSessionEndTime = now().toDate();
    rec.sessionStartTime = null;
    rec.sessionEndTime = null;
    rec.startFormatted = null;
    rec.endFormatted = null;
    rec.isLocked = true;
    await rec.save();
    const sessionsRemaining = rec.dailyUsageLimit - rec.openCountToday; 
    if (rec.nextSessionGap > 0) {
      const unlockTime = moment(rec.lastSessionEndTime).add(rec.nextSessionGap, 'minutes');
    }
    res.json({ 
      success: true, 
      locked: true, 
      message: 'Session locked',
      sessionsRemaining,
      nextUnlockTime: rec.nextSessionGap > 0 
        ? moment(rec.lastSessionEndTime).add(rec.nextSessionGap, 'minutes').toISOString()
        : null
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;