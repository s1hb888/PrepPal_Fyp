const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const Notification = require('../models/Notification');
const ScreenTime = require('../models/ScreenTime');
const User = require('../models/User');


const router = express.Router();


const { sendFCM } = require('../server'); 

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

// Unlock if gap passed
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
/* ───── App background start/end ───── */
router.post('/app-background', async (req, res) => {
  try {
    const { userId, action, role } = req.body;
    if (!isId(userId) || role !== 'kid') 
      return res.json({ success: true, skipped: true });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec || !rec.notificationsEnabled) 
      return res.json({ success: true, skipped: true });

    const nowMoment = moment();

    // 🔹 START background session
    if (action === 'start') {
      if (!rec.backgroundStartTime) {
        rec.backgroundStartTime = new Date();
        await rec.save();
      }
      return res.json({ success: true, started: true, sessionNumber: rec.openCountToday || 1 });
    }

    // 🔹 END background session
    if (action === 'end' && rec.backgroundStartTime) {
      const diffMs = nowMoment.diff(moment(rec.backgroundStartTime));
      const diffSec = Math.floor(diffMs / 1000);
      const diffStr = diffSec < 60 ? `${diffSec} seconds` : `${Math.ceil(diffSec / 60)} minutes`;

      const sessionNumber = rec.openCountToday || 1;

      if (!rec.isLocked) {
        await Notification.create({
          userId: rec.userId,
          message: `App was in background for ${diffStr} (Session ${sessionNumber}).`,
          type: 'background_exit',
        });
      }

      rec.backgroundStartTime = null;
      await rec.save();
      return res.json({ success: true, diffStr, sessionNumber });
    }

    res.status(400).json({ success: false, msg: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



/* ───── Heartbeat ───── */
router.post('/heartbeat', async (req, res) => {
  try {
    const { userId, ts, isActive } = req.body;
    if (!isId(userId)) return res.json({ success: true, skipped: true });

    const user = await User.findById(userId);
    if (!user || user.role !== 'kid') {
      return res.json({ success: true, skipped: true });
    }

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, msg: 'Record not found' });

    rec.lastHeartbeat = new Date(ts);
    rec.isAppActive = !!isActive;

    // ✅ ensure sessionStartTime set
    if (!rec.sessionStartTime) {
      rec.sessionStartTime = new Date();
    }

    await rec.save();
    res.json({ success: true });
  } catch (err) {
    console.error('[❌ Heartbeat server error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// ───── App Exit (Force Exit Only) ─────
const FORCE_KILL_INTERVAL_MS = 5000; // 5 sec test
const HEARTBEAT_TIMEOUT_MS = 5000; 

const checkForceKills = async () => {
  try {
    const now = new Date();

    const kids = await User.find({ role: 'kid' }, '_id expoToken');
    if (!kids.length) return;

    const recs = await ScreenTime.find({
      userId: { $in: kids.map(k => k._id) },
      sessionStartTime: { $ne: null },
      sessionEndTime: null, // only ongoing sessions
    });

    for (const rec of recs) {
      const user = kids.find(k => String(k._id) === String(rec.userId));
      const lastHeartbeatDiff = rec.lastHeartbeat ? now - rec.lastHeartbeat : Infinity;
      const sessionNumber = (rec.openCountToday || 0);

      if (lastHeartbeatDiff > HEARTBEAT_TIMEOUT_MS) {
        const message = `App was forcefully closed before session end (Session ${sessionNumber + 1}).`;

        // Create notification
        await Notification.create({
          userId: rec.userId,
          message,
          type: 'app_exit',
        });

        // Send FCM
        if (user?.expoToken) await sendFCM(user._id, message);

        // Cleanup session
        rec.sessionStartTime = null;
        rec.sessionEndTime = null;
        rec.backgroundStartTime = null;
        rec.isLocked = true;
        rec.openCountToday = sessionNumber + 1;

        await rec.save();

        console.log(`[🚨 Force kill detected] ${message}`);
      }
    }
  } catch (err) {
    console.error('[❌ checkForceKills error]', err.message || err);
  }
};

// Manual / frontend-triggered exit
router.post('/app-exit', async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!isId(userId) || role !== 'kid') return res.json({ success: true, skipped: true });

    const rec = await ScreenTime.findOne({ userId });
    if (!rec) return res.status(404).json({ success: false, msg: 'No ScreenTime record' });

    // Only send notification if session hasn't ended
    if (rec.sessionStartTime && !rec.sessionEndTime) {
      const sessionNumber = num(rec.openCountToday) + 1;

      await Notification.create({
        userId: rec.userId,
        message: `App was forcefully closed before session end (Session ${sessionNumber}).`,
        type: 'app_exit',
      });

      const user = await User.findById(userId);
      if (user?.expoToken) await sendFCM(user._id, `App was forcefully closed before session end (Session ${sessionNumber}).`);

      // Cleanup session
      rec.sessionStartTime = null;
      rec.sessionEndTime = null;
      rec.backgroundStartTime = null;
      rec.isLocked = true;
      rec.openCountToday = sessionNumber;
      await rec.save();

      console.log(`[🚨 Manual / Frontend exit] User: ${userId}, Session: ${sessionNumber}`);
    }

    res.json({ success: true, notified: true });
  } catch (err) {
    console.error('[ /app-exit error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single notification
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, msg: "Invalid ID" });

    const result = await Notification.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, msg: "Notification not found" });

    res.json({ success: true });
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


module.exports = { router, checkForceKills };

