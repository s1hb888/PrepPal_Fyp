const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const Notification = require('../models/Notification');
const ScreenTime = require('../models/ScreenTime');
const User = require('../models/User');

const router = express.Router();

const now = () => moment();
const num = (v) => Number(v || 0);
const isId = (id) => mongoose.Types.ObjectId.isValid(id);
const human = (min) => `${min} minute${min === 1 ? '' : 's'}`;
const todayQ = (userId) => ({
  userId,
  createdAt: {
    $gte: moment().startOf('day').toDate(),
    $lte: moment().endOf('day').toDate(),
  },
});

// Avoid duplicate notifications
async function alreadySentToday(userId, type) {
  const existing = await Notification.findOne({ ...todayQ(userId), type });
  return !!existing;
}

/* ───── Notify: App sent to background ───── */
router.post('/app-background', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isId(userId)) return res.status(400).json({ success: false, msg: 'Invalid userId' });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, msg: 'Screen time record missing' });

    if (!rec.sessionStartTime || rec.isLocked) {
      return res.json({ success: true, skipped: true });
    }

    const used = Math.max(1, Math.ceil(moment().diff(rec.sessionStartTime, 'minutes', true)));
    const left = Math.max(0, num(rec.sessionDuration) - used);

    rec.totalUsedTimeToday = Math.min(rec.totalUsedTimeToday + used, num(rec.totalDailyTime) || Infinity);
    rec.lastSessionEndTime = now().toDate();
    rec.sessionStartTime = null;
    rec.sessionEndTime = null;
    rec.isLocked = true;

    await rec.save();

    if (await alreadySentToday(userId, 'background_exit')) {
      return res.json({ success: true, dup: true });
    }

    const parent = await User.findById(userId);
    const kidName = parent?.kidName || 'Kid';

const recCheck = await ScreenTime.findOne({ userId });
if (!recCheck || recCheck.notificationsEnabled === false) {
  return res.json({ success: true, skipped: true, reason: 'Notifications disabled' });
}

const msg = `App was sent to background: used ${human(used)} of ${human(rec.sessionDuration)}.`;

// Check if enough of session was used (e.g., less than 50%) to still call it early exit
const isEarly = used < Math.floor(rec.sessionDuration * 0.6); // tweakable threshold

await Notification.create({
  userId,
  message: msg,
  type: isEarly ? 'early_exit' : 'background_exit',
});


    res.json({ success: true, locked: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ───── Notify: App closed before session end ───── */
router.post('/notify-parent', async (req, res) => {
  try {
    const { userId, elapsedMinutes, sessionDuration } = req.body;

    if (!isId(userId) || !elapsedMinutes || !sessionDuration) {
      return res.status(400).json({ success: false, msg: 'Bad request data' });
    }

    if (await alreadySentToday(userId, 'early_exit')) {
      return res.json({ success: true, dup: true });
    }

    const parent = await User.findById(userId);
    const kidName = parent?.kidName || 'Kid';

    const msg = `App was closed early: used ${human(elapsedMinutes)} of ${human(sessionDuration)}.`;


    await Notification.create({
      userId,
      message: msg,
      type: 'early_exit',
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Get Notifications ───── */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false });

    const data = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Mark Notification as Seen ───── */
router.patch('/mark-read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false });

    await Notification.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ───── Clear All Notifications ───── */
router.delete('/clear/:userId', async (req, res) => {
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
