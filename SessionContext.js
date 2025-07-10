/* SessionProvider.js – gap handled ONLY by backend */

import React, {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import API_BASE_URL from './frontend/config';

export const SessionContext = createContext();

export const SessionProvider = ({ children, navigationRef, includedScreens = [] }) => {
  /* ───────── UI state ───────── */
  const [lockVisible, setLockVisible] = useState(false);

  /* ───────── refs ───────── */
  const intervalRef       = useRef(null);
  const sessionEndRef     = useRef(null);
  const appState          = useRef(AppState.currentState);
  const currentKidIdRef   = useRef(null);
  const wasLockedRef      = useRef(false);   // track lock ↔ unlock transitions
  const stopPollingRef    = useRef(false);   // true when daily limits exhausted

  /* ───────── helpers ───────── */
  const clearIntervalSafe = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[⏹️ Interval cleared]');
    }
  };

  const enforceLockUI = () => {
    if (!lockVisible) {
      setLockVisible(true);
      console.log('[🔒 Lock Modal SHOWN]');
      AsyncStorage.setItem('isLocked', 'true');
    }
  };

  const clearLockUI = () => {
    if (lockVisible) {
      setLockVisible(false);
      console.log('[🔓 Lock Modal CLEARED]');
      AsyncStorage.setItem('isLocked', 'false');
    }
  };

  /* ───────── start new session ───────── */
  const startKidSession = useCallback(async () => {
    if (stopPollingRef.current) return;            // daily limit exceeded – nothing more to do

    const stored = await AsyncStorage.getItem('user');
    const user   = JSON.parse(stored || '{}');
    if (!user || user.role !== 'kid') return;

    currentKidIdRef.current = user._id;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/screen-time/start-session`, {
        userId: user._id,
      });

      if (!data?.success) {
        enforceLockUI();                            // backend said “locked” (gap or limits)
        return;
      }

      /* got green‑light */
      const endTime = moment(data.endISO);
      sessionEndRef.current = endTime;
      clearLockUI();
      clearIntervalSafe();
      bootInterval(user._id);
    } catch (err) {
      console.log('[❌ startKidSession error]', err?.message || err);
      enforceLockUI();
    }
  }, []);

  /* ───────── poll backend every second ───────── */
  const bootInterval = (userId) => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${userId}`);
        const rec = data?.data;
        if (!rec) return;

        const now           = moment();
        const sessionEnd    = rec.sessionEndTime ? moment(rec.sessionEndTime) : null;
        const limitSessions = rec.dailyUsageLimit > 0 && rec.openCountToday >= rec.dailyUsageLimit;
        const limitTime     = rec.totalDailyTime  > 0 && rec.totalUsedTimeToday >= rec.totalDailyTime;

        /* ---------- still inside running session ---------- */
        if (!rec.isLocked) {
          wasLockedRef.current = false;
          if (sessionEnd && now.isSameOrAfter(sessionEnd)) {
            await axios.post(`${API_BASE_URL}/api/screen-time/lock-session`, {
              userId,
              sessionEnded: true,
            });
            enforceLockUI();             
          }
          return;
        }

        /* ---------- backend says: locked ---------- */
        enforceLockUI();

        /* stop forever if daily usage exhausted */
        if (limitSessions || limitTime) {
          stopPollingRef.current = true;
          clearIntervalSafe();
          console.log('[🔚 Daily limit exhausted – polling stopped]');
          return;
        }

        /* transition: was locked, backend just unlocked -> start new session */
        if (wasLockedRef.current && !rec.isLocked) {
          wasLockedRef.current = false;
          clearLockUI();
          clearIntervalSafe();
          startKidSession();
          return;
        }

        // remember lock state
        wasLockedRef.current = rec.isLocked;
      } catch (err) {
        console.error('[🔥 Interval error]', err?.message || err);
      }
    }, 1000);

    console.log('[🚀 Interval STARTED]');
  };

  /* ───────── lifecycle ───────── */
 useEffect(() => {
  (async () => {
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored || '{}');
    if (user?.role === 'kid') {
      startKidSession();
    }
  })();
}, []);


useEffect(() => {
  const sub = AppState.addEventListener('change', async (nextAppState) => {
    const prev = appState.current;
    appState.current = nextAppState;

    if (prev === 'active' && nextAppState.match(/inactive|background/)) {
      // ✅ App is going to background – send notification
      try {
        const stored = await AsyncStorage.getItem('user');
        const user = JSON.parse(stored || '{}');
        if (user?.role === 'kid') {{
  stopPollingRef.current = false;
  startKidSession();
}
          console.log('[📴 App going to background – notifying backend]');
          await axios.post(`${API_BASE_URL}/api/notifications/app-background`,{
            userId: user._id,
          });
        }
      } catch (e) {
        console.log('[❌ Error notifying background exit]', e?.message || e);
      }
    }

    if (prev.match(/inactive|background/) && nextAppState === 'active') {
      stopPollingRef.current = false;        // new day? try again
      startKidSession();
    }
  });

  return () => sub.remove();
}, [startKidSession]);


  /* ───────── UI actions ───────── */
  const backToLogin = async () => {
    clearIntervalSafe();
    clearLockUI();
    stopPollingRef.current = false;
    if (navigationRef.current?.isReady()) {
      navigationRef.current.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  /* ───────── render ───────── */
  return (
<SessionContext.Provider value={{ startKidSession }}>
  {children}

  {/* 🔒 Show lock modal ONLY for kid role */}
  {lockVisible && (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={80} color="#fff" />
          </View>
          <Text style={styles.title}>Time’s Up!</Text>
          <Text style={styles.msg}>You can use the app again when it unlocks.</Text>
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

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  card:    { width: '85%', backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', padding: 30 },
  iconWrap:{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#EF3349', justifyContent: 'center', alignItems: 'center', marginTop: -70 },
  title:   { fontSize: 26, fontWeight: 'bold', color: '#EF3349', marginTop: 22 },
  msg:     { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 14 },
  btn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2BCB9A', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 50, marginTop: 26 },
  btnTxt:  { color: '#fff', marginLeft: 10, fontSize: 16, fontWeight: '600' },
});

export default SessionProvider;
