const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const Notification = require('../models/Notification');
const ScreenTime = require('../models/ScreenTime');
const router = express.Router();

const now = () => moment();
const num = v => Number(v || 0);
const isId = id => mongoose.Types.ObjectId.isValid(id);
const human = min => `${min} minute${min === 1 ? '' : 's'}`;

// Reset daily counters
async function doDailyReset(rec) {
  if (!rec.lastReset || now().isAfter(moment(rec.lastReset).endOf('day'))) {
    rec.openCountToday = 0;
    rec.totalUsedTimeToday = 0;
    rec.isLocked = false;
    rec.lastReset = now().toDate();
    await rec.save();
  }
}

// Unlock session if gap has passed
async function autoUnlockIfGapPassed(rec) {
  if (rec.isLocked && rec.lastSessionEndTime && num(rec.nextSessionGap) > 0) {
    const unlockAt = moment(rec.lastSessionEndTime).add(num(rec.nextSessionGap), 'minutes');
    if (now().isSameOrAfter(unlockAt)) {
      rec.isLocked = false;
      await rec.save();
    }
  }
}

/* ───── App background start/end ───── */
router.post('/app-background', async (req, res) => {
  try {
    const { userId, action, role } = req.body;
    if (!isId(userId) || role !== 'kid') return res.json({ success: true, skipped: true });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec || !rec.notificationsEnabled) return res.json({ success: true, skipped: true });

    await doDailyReset(rec);
    await autoUnlockIfGapPassed(rec);

    if (action === 'start' && rec.sessionStartTime && !rec.backgroundStartTime) {
      rec.backgroundStartTime = new Date();
      await rec.save();
      return res.json({ success: true, started: true });
    }

    if (action === 'end' && rec.backgroundStartTime) {
      const diffMin = Math.max(1, Math.ceil(moment().diff(moment(rec.backgroundStartTime), 'minutes', true)));
      await Notification.create({
        userId: rec.userId,
        message: `App was in background for ${human(diffMin)} (Session ${rec.openCountToday || 1}).`,
        type: 'background_exit',
      });
      rec.backgroundStartTime = null;
      await rec.save();
      return res.json({ success: true, notified: true, diffMin });
    }

    res.status(400).json({ success: false, msg: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Heartbeat ───── */
router.post('/heartbeat', async (req, res) => {
  try {
    const { userId, role, ts, isActive } = req.body;
    if (!isId(userId) || role !== 'kid') return res.json({ success: true, skipped: true });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, msg: 'Record not found' });

    rec.lastHeartbeat = new Date(ts);
    rec.isAppActive = !!isActive;
    await rec.save();

    // Background session ended check (optional redundant safety)
    if (!rec.isAppActive && rec.backgroundStartTime && rec.sessionEndTime && now().isSameOrAfter(moment(rec.sessionEndTime))) {
      const diffMin = Math.max(1, Math.ceil(moment().diff(moment(rec.backgroundStartTime), 'minutes', true)));
      await Notification.create({
        userId: rec.userId,
        message: `App was in background for ${human(diffMin)} (Session ${rec.openCountToday || 1}).`,
        type: 'background_exit',
      });
      rec.backgroundStartTime = null;
      await rec.save();
      console.log(`Background exit notification created for user ${rec.userId}`);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── App Exit ───── */
router.post('/app-exit', async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!isId(userId) || role !== 'kid') return res.json({ success: true, skipped: true });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, msg: 'No ScreenTime record' });

    const nowMoment = moment();
    if (rec.backgroundStartTime) {
      const diffMin = Math.max(1, Math.ceil(nowMoment.diff(moment(rec.backgroundStartTime), 'minutes', true)));
      await Notification.create({
        userId: rec.userId,
        message: `App was in background for ${human(diffMin)} (Session ${rec.openCountToday || 1}).`,
        type: 'background_exit',
      });
    } else {
      await Notification.create({
        userId: rec.userId,
        message: `App was explicitly closed (Session ${rec.openCountToday + 1}).`,
        type: 'app_exit',
      });
    }

    rec.openCountToday = num(rec.openCountToday) + 1;
    rec.lastSessionEndTime = nowMoment.toDate();
    rec.sessionStartTime = null;
    rec.sessionEndTime = null;
    rec.backgroundStartTime = null;
    rec.isLocked = true;
    await rec.save();

    res.json({ success: true, notified: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Force Kill & Expired Background Checker ───── */
const checkForceKillAndBackground = async () => {
  try {
    const recs = await ScreenTime.find({
      sessionStartTime: { $ne: null } // only active sessions
    });

    const nowMoment = moment();

    for (const rec of recs) {
      let notificationCreated = false;

      // ✅ Background expired session
      if (rec.backgroundStartTime && rec.sessionEndTime && nowMoment.isSameOrAfter(moment(rec.sessionEndTime))) {
        const diffMin = Math.max(1, Math.ceil(nowMoment.diff(moment(rec.backgroundStartTime), 'minutes', true)));
        await Notification.create({
          userId: rec.userId,
          message: `App was in background for ${human(diffMin)} (Session ${rec.openCountToday || 1}).`,
          type: 'background_exit',
        });
        notificationCreated = true;
        console.log(`Background exit notification auto-created for user ${rec.userId}`);
      }

      // ✅ Force kill / app never returned before session end
      // ✅ Force kill / app never returned before session end
if (!notificationCreated && rec.sessionStartTime && rec.sessionEndTime && !rec.isAppActive && nowMoment.isSameOrAfter(moment(rec.sessionEndTime))) {
  await Notification.create({
    userId: rec.userId,
    message: `App closed before Session ${rec.openCountToday || 1}.`,
    type: 'app_exit',
  });
  notificationCreated = true;
}


      if (notificationCreated) {
        rec.lastSessionEndTime = nowMoment.toDate();
        rec.sessionEndTime = nowMoment.toDate();
        rec.sessionStartTime = null;
        rec.sessionEndTime = null;
        rec.backgroundStartTime = null;
        rec.isLocked = true;
        await rec.save();
      }
    }
  } catch (err) {
    console.error("Error in checkForceKillAndBackground:", err.message);
  }
};

// Run every 60 seconds
setInterval(checkForceKillAndBackground, 60000);


/* ───── Get notifications ───── */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false });

    const data = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Mark all as read ───── */
router.patch("/mark-all-read/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false });

    await Notification.updateMany({ userId, seen: false }, { seen: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Clear all notifications ───── */
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false });

    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;