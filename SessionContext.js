/* SessionProvider.js – Updated */
import React, { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import API_BASE_URL from './frontend/config';
import Constants from "expo-constants";

export const SessionContext = createContext();

export const SessionProvider = ({ children, navigationRef, includedScreens = [] }) => {
  const [lockVisible, setLockVisible] = useState(false);
  const [lockReason, setLockReason] = useState('');

  const intervalRef = useRef(null);
  const sessionEndRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const currentKidIdRef = useRef(null);

const registerAndSaveFcmToken = async (userId) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('[⚠️ Notifications permission denied]');
      return null;
    }

    const tokenObj = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });

    const expoToken  = tokenObj.data;
    console.log('Expo Push Token:', expoToken);

    const res = await axios.post(`${API_BASE_URL}/api/save-expo-token`, { userId, expoToken  });
    console.log('Expo token saved:', res.data);

    return expoToken;
  } catch (err) {
    console.log('[❌ FCM token save error]', err);
    return null;
  }
};

  const enforceLockUI = (reason = '') => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (!currentRoute) return;

    if (includedScreens.includes(currentRoute)) {
      setLockReason(reason);
      if (!lockVisible) {
        setLockVisible(true);
        AsyncStorage.setItem('isLocked', 'true');
        console.log('[🔒 Lock Modal SHOWN]');
      }
    }
  };

  const clearLockUI = () => {
    if (lockVisible) {
      setLockVisible(false);
      setLockReason('');
      AsyncStorage.setItem('isLocked', 'false');
      console.log('[🔓 Lock Modal CLEARED]');
    }
  };

const checkForceKill = async (userId, sessionEnd) => {
  try {
    // Only send FCM if session hasn't ended yet
    if (sessionEnd && moment().isBefore(sessionEnd)) {
      await axios.post(`${API_BASE_URL}/api/notifications/app-exit`, {
        userId,
        role: 'kid',
        forced: true, // optional flag
      });
      console.log('[🚨 Forced Exit Detected & Notified]');
    }
  } catch (err) {
    console.error('[❌ checkForceKill error]', err?.message || err);
  }
};

const clearIntervalSafe = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    console.log('[🛑 Interval cleared]');
  }
};

 const startKidSession = useCallback(async () => {
  const stored = await AsyncStorage.getItem('user');
  const user = JSON.parse(stored || '{}');
  if (!user || user.role !== 'kid') return;

  currentKidIdRef.current = user._id;

  // 🔹 Save FCM token BEFORE starting session
  await registerAndSaveFcmToken(user._id);

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/screen-time/start-session`, {
      userId: user._id,
    });

    if (!data?.success || data?.locked) {
      const reason = data?.message || 'Daily screentime limit exceeded. You can try again tomorrow.';
      enforceLockUI(reason);
      return;
    }

    // Session started successfully
    sessionEndRef.current = moment(data.endISO);
    clearLockUI();
    clearIntervalSafe();
    bootInterval(user._id);

  } catch (err) {
    console.log('[❌ startKidSession error]', err?.message || err);
    enforceLockUI('Daily screentime limit exceeded. You can try again tomorrow.');
  }
}, []);

  const bootInterval = (userId) => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${userId}`);
        const rec = data?.data;
        if (!rec) return;

        const nowMoment = moment();
        const sessionEnd = rec.sessionEndTime ? moment(rec.sessionEndTime) : null;

        // Daily session / time limit
        const limitSessions = rec.dailyUsageLimit > 0 && rec.openCountToday >= rec.dailyUsageLimit;
        const limitTime = rec.totalDailyTime > 0 && rec.totalUsedTimeToday >= rec.totalDailyTime;

        if (limitSessions || limitTime) {
          clearIntervalSafe();
          enforceLockUI('Daily session limit reached. You can try again tomorrow.');
          return;
        }

        // Lock **every time a session ends**
        if (sessionEnd && nowMoment.isSameOrAfter(sessionEnd)) {
          await axios.post(`${API_BASE_URL}/api/screen-time/lock-session`, {
            userId,
            sessionEnded: true,
          });
          enforceLockUI();
        }
      } catch (err) {
        console.error('[🔥 Interval error]', err?.message || err);
      }
    }, 1000);
  };

useEffect(() => {
  (async () => {
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored || '{}');
    if (user?.role === 'kid') {
      const lockFlag = await AsyncStorage.getItem('isLocked');
      if (lockFlag === 'true') {
        enforceLockUI();
        return;
      }
      startKidSession();
    }
  })();
}, [startKidSession]);

// Cleanup effect ko remove kar do
useEffect(() => {
  return () => {
    clearIntervalSafe();
  };
}, []);


useEffect(() => {
  const interval = setInterval(async () => {
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored || '{}');
    if (!user || user.role !== 'kid') return;

    try {
      await axios.post(`${API_BASE_URL}/api/notifications/heartbeat`, {
        userId: user._id,
        role: 'kid',
        ts: new Date(),
        isActive: AppState.currentState === 'active',
      });
    } catch (err) {
      console.log('[❌ Heartbeat error]', err?.message || err);
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);


useEffect(() => {
  const sub = AppState.addEventListener('change', async (nextAppState) => {
    const prev = appState.current;
    appState.current = nextAppState;

    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored || '{}');
    if (!user || user.role !== 'kid') return;

    try {
      // 🔹 App goes to background
      if (prev === 'active' && nextAppState.match(/inactive|background/)) {
        await axios.post(`${API_BASE_URL}/api/notifications/app-background`, {
          userId: user._id,
          role: 'kid',
          action: 'start',
        });
      }

      // 🔹 App returns to foreground
      if (prev.match(/inactive|background/) && nextAppState === 'active') {
        const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${user._id}`);
        const rec = data?.data;

        // Session ended naturally → lock UI
        if (rec?.sessionEndTime && moment().isSameOrAfter(moment(rec.sessionEndTime))) {
          await axios.post(`${API_BASE_URL}/api/screen-time/lock-session`, {
            userId: user._id,
            sessionEnded: true,
          });
          enforceLockUI();
        }

        // End background session if it was started
        if (rec?.backgroundStartTime) {
          await axios.post(`${API_BASE_URL}/api/notifications/app-background`, {
            userId: user._id,
            role: 'kid',
            action: 'end',
          });
        }
      }
    } catch (err) {
      console.log('[❌ AppState change error]', err?.message || err);
    }
  });

  return () => sub.remove();
}, []);


  const backToLogin = async () => {
    clearIntervalSafe();
    clearLockUI();
    if (navigationRef.current?.isReady()) {
      navigationRef.current.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  return (
    <SessionContext.Provider value={{ startKidSession }}>
      {children}

      {lockVisible && includedScreens.includes(navigationRef.current?.getCurrentRoute()?.name) && (
        <Modal transparent visible animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="lock-closed-outline" size={80} color="#fff" />
              </View>
              <Text style={styles.title}>Time’s Up!</Text>
              <Text style={styles.msg}>{lockReason || 'You can use the app again when it unlocks.'}</Text>
              <TouchableOpacity style={styles.btn} onPress={backToLogin}>
                <Ionicons name="exit-outline" size={22} color="#fff" />
                <Text style={styles.btnTxt}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SessionContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  card: { width: '85%', backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', padding: 30 },
  iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EF3349', justifyContent: 'center', alignItems: 'center', marginTop: -70 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#EF3349', marginTop: 22 },
  msg: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 14 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2BCB9A', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 50, marginTop: 26 },
  btnTxt: { color: '#fff', marginLeft: 10, fontSize: 16, fontWeight: '600' },
});

export default SessionProvider;
