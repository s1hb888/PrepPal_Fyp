/* SessionProvider.js – COMPLETE FIX */
import React, { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, AppState, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import API_BASE_URL from './frontend/config';
import Constants from "expo-constants";
import * as Notifications from 'expo-notifications';

export const SessionContext = createContext();

export const SessionProvider = ({ children, navigationRef, includedScreens = [] }) => {
  const [lockVisible, setLockVisible] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [nextSessionTime, setNextSessionTime] = useState(null);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const currentKidIdRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isProcessingRef = useRef(false);
  const lastSessionEndTimeRef = useRef(null); // Track when we locked a session

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

      const expoToken = tokenObj.data;
      console.log('Expo Push Token:', expoToken);

      const res = await axios.post(`${API_BASE_URL}/api/save-expo-token`, { userId, expoToken });
      console.log('Expo token saved:', res.data);

      return expoToken;
    } catch (err) {
      console.log('[❌ FCM token save error]', err);
      return null;
    }
  };

  const enforceLockUI = (reason = '', nextSessionAt = null, isDailyLimit = false) => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (!currentRoute) return;

    if (includedScreens.includes(currentRoute)) {
      setLockReason(reason);
      setNextSessionTime(nextSessionAt);
      setIsDailyLimitReached(isDailyLimit);
      
      if (!lockVisible) {
        setLockVisible(true);
        AsyncStorage.setItem('isLocked', 'true');
        console.log('[🔒 LOCK MODAL SHOWN] Reason:', reason);
        
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  };

  const clearLockUI = () => {
    if (lockVisible) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setLockVisible(false);
        setLockReason('');
        setNextSessionTime(null);
        setIsDailyLimitReached(false);
        AsyncStorage.setItem('isLocked', 'false');
        console.log('[🔓 LOCK MODAL CLEARED]');
      });
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

    console.log('\n═══════════════════════════════════════');
    console.log('[🚀 ATTEMPTING TO START NEW SESSION]');
    console.log('═══════════════════════════════════════');

    await registerAndSaveFcmToken(user._id);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/screen-time/start-session`, {
        userId: user._id,
      });

      console.log('[📊 Backend response:', JSON.stringify(data, null, 2));

      if (!data?.success || data?.locked) {
        const reason = data?.message || 'Daily screentime limit exceeded.';
        console.log('[❌ SESSION START FAILED:', reason);
        console.log('[🚫 Daily limit reached - locking permanently]');
        clearIntervalSafe();
        enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
        return false;
      }

      console.log('[✅ SESSION STARTED SUCCESSFULLY!]');
      console.log('[⏰ Session end time:', data.endISO);
      console.log('═══════════════════════════════════════\n');
      
      clearLockUI();
      isProcessingRef.current = false;
      clearIntervalSafe();
      bootInterval(user._id);
      return true;

    } catch (err) {
      console.log('[❌ startKidSession error]', err?.message || err);
      clearIntervalSafe();
      enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
      return false;
    }
  }, []);

  const bootInterval = (userId) => {
    if (intervalRef.current) {
      console.log('[⚠️ Interval already running, clearing first]');
      clearIntervalSafe();
    }

    console.log('[▶️ STARTING INTERVAL for userId:', userId);

    intervalRef.current = setInterval(async () => {
      if (isProcessingRef.current) {
        return; // Skip if already processing
      }

      try {
        isProcessingRef.current = true;

        const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${userId}`);
        const rec = data?.data;
        if (!rec) {
          console.log('[⚠️ No screen time record found]');
          isProcessingRef.current = false;
          return;
        }

        const nowMoment = moment();
        const sessionEnd = rec.sessionEndTime ? moment(rec.sessionEndTime) : null;
        const sessionStart = rec.sessionStartTime ? moment(rec.sessionStartTime) : null;
        const isLocked = rec.isLocked;

        const sessionsUsed = rec.openCountToday || 0;
        const sessionsAllowed = rec.dailyUsageLimit || 0;
        const sessionsRemaining = sessionsAllowed - sessionsUsed;

        // ✅ CASE 1: Active session that has ended
        if (sessionStart && sessionEnd && nowMoment.isSameOrAfter(sessionEnd) && !isLocked) {
          console.log('\n╔═══════════════════════════════════════╗');
          console.log('║   SESSION DURATION REACHED!           ║');
          console.log('╚═══════════════════════════════════════╝');
          console.log('[📊 Details:');
          console.log('  - Session start:', sessionStart.format('HH:mm:ss'));
          console.log('  - Session end:', sessionEnd.format('HH:mm:ss'));
          console.log('  - Current time:', nowMoment.format('HH:mm:ss'));
          console.log('  - Sessions used:', sessionsUsed);
          console.log('  - Sessions allowed:', sessionsAllowed);
          console.log('  - Sessions remaining:', sessionsRemaining);
          
          // Lock the session
          console.log('[🔒 Calling /lock-session API...]');
          await axios.post(`${API_BASE_URL}/api/screen-time/lock-session`, {
            userId,
            sessionEnded: true,
          });

          // Store when we locked this session
          lastSessionEndTimeRef.current = nowMoment.toISOString();

          // Get fresh data
          const { data: freshData } = await axios.get(`${API_BASE_URL}/api/screen-time/${userId}`);
          const freshRec = freshData?.data;

          const newSessionsUsed = freshRec.openCountToday || 0;
          const newSessionsAllowed = freshRec.dailyUsageLimit || 0;
          const newSessionsRemaining = newSessionsAllowed - newSessionsUsed;

          console.log('[📊 After locking:');
          console.log('  - Backend isLocked:', freshRec?.isLocked);
          console.log('  - Sessions used:', newSessionsUsed);
          console.log('  - Sessions remaining:', newSessionsRemaining);

          if (freshRec?.isLocked) {
            console.log('[✅ Backend confirmed lock]');
            
            if (newSessionsRemaining <= 0) {
              console.log('[🚫 NO MORE SESSIONS - Final lock for the day]');
              console.log('╚═══════════════════════════════════════╝\n');
              clearIntervalSafe();
              enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
            } else {
              let nextSessionAt = null;
              if (freshRec.lastSessionEndTime && freshRec.nextSessionGap > 0) {
                nextSessionAt = moment(freshRec.lastSessionEndTime).add(freshRec.nextSessionGap, 'minutes');
                console.log('[⏰ Next session available at:', nextSessionAt.format('HH:mm:ss'));
              }

              console.log(`[✅ ${newSessionsRemaining} session(s) remaining - Starting gap period]`);
              console.log('╚═══════════════════════════════════════╝\n');
              
              enforceLockUI(
                `Great job! 🎉 Time for a break. You have ${newSessionsRemaining} more session${newSessionsRemaining > 1 ? 's' : ''} today!`,
                nextSessionAt,
                false
              );
            }
          }
          
          isProcessingRef.current = false;
          return;
        }

        // ✅ CASE 2: Locked, waiting for gap to pass
        if (isLocked && lockVisible && !isDailyLimitReached && rec.lastSessionEndTime && rec.nextSessionGap > 0) {
          const gapEndTime = moment(rec.lastSessionEndTime).add(rec.nextSessionGap, 'minutes');
          
          // Check if this is a different lock than we last processed
          const currentLockTime = rec.lastSessionEndTime;
          const isNewLock = currentLockTime !== lastSessionEndTimeRef.current;
          
          if (nowMoment.isSameOrAfter(gapEndTime)) {
            console.log('\n╔═══════════════════════════════════════╗');
            console.log('║   GAP PERIOD COMPLETED!               ║');
            console.log('╚═══════════════════════════════════════╝');
            console.log('[📊 Details:');
            console.log('  - Gap ended at:', gapEndTime.format('HH:mm:ss'));
            console.log('  - Current time:', nowMoment.format('HH:mm:ss'));
            console.log('  - Sessions remaining:', sessionsRemaining);
            
            if (sessionsRemaining > 0) {
              console.log('[🎯 Attempting to start next session...]');
              console.log('╚═══════════════════════════════════════╝\n');
              
              // Clear interval and lock UI before starting new session
              clearIntervalSafe();
              clearLockUI();
              isProcessingRef.current = false;
              
              // Start new session (this will create a new interval)
              const started = await startKidSession();
              
              if (!started) {
                console.log('[❌ Failed to start next session - Daily limit may have been reached]');
              }
            } else {
              console.log('[🚫 No sessions remaining]');
              console.log('╚═══════════════════════════════════════╝\n');
              clearIntervalSafe();
              enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
            }
            
            isProcessingRef.current = false;
            return;
          }
        }

        // ✅ CASE 3: Backend shows unlocked but we haven't started a new session yet
        if (!isLocked && !sessionStart && lockVisible && !isDailyLimitReached) {
          console.log('\n[🔓 Backend auto-unlocked detected]');
          console.log('[📊 Sessions remaining:', sessionsRemaining);
          
          if (sessionsRemaining > 0) {
            console.log('[🎯 Starting next session after auto-unlock...\n');
            clearIntervalSafe();
            clearLockUI();
            isProcessingRef.current = false;
            await startKidSession();
            return;
          } else {
            console.log('[🚫 No sessions remaining despite unlock\n');
            clearIntervalSafe();
            enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
          }
          
          isProcessingRef.current = false;
          return;
        }

        // ✅ CASE 4: Check if we've reached daily limit without active session
        if (!sessionStart && sessionsAllowed > 0 && sessionsUsed >= sessionsAllowed && !lockVisible) {
          console.log('[🚫 Daily session limit reached (no active session)]');
          clearIntervalSafe();
          enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
          isProcessingRef.current = false;
          return;
        }

        isProcessingRef.current = false;

      } catch (err) {
        console.error('[🔥 Interval error]', err?.message || err);
        isProcessingRef.current = false;
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
          console.log('[🔒 App opened with locked state]');
          enforceLockUI('Checking your screen time...', null, false);
          
          try {
            const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${user._id}`);
            const rec = data?.data;
            
            if (rec) {
              const sessionsUsed = rec.openCountToday || 0;
              const sessionsAllowed = rec.dailyUsageLimit || 0;
              const sessionsRemaining = sessionsAllowed - sessionsUsed;
              
              if (sessionsAllowed > 0 && sessionsUsed >= sessionsAllowed) {
                console.log('[🚫 Daily limit still reached]');
                enforceLockUI('All done for today! 🌙 Come back tomorrow for more fun!', null, true);
              } else if (!rec.isLocked) {
                console.log('[✅ No longer locked, starting session]');
                clearLockUI();
                startKidSession();
              } else {
                console.log('[⏰ Still in gap period]');
                let nextSessionAt = null;
                if (rec.lastSessionEndTime && rec.nextSessionGap > 0) {
                  nextSessionAt = moment(rec.lastSessionEndTime).add(rec.nextSessionGap, 'minutes');
                }
                enforceLockUI(
                  `Time for a break! You have ${sessionsRemaining} more session${sessionsRemaining > 1 ? 's' : ''} today!`,
                  nextSessionAt,
                  false
                );
                bootInterval(user._id);
              }
            }
          } catch (err) {
            console.log('[❌ Error checking lock state:', err?.message);
          }
          return;
        }
        console.log('[🎯 Starting initial session]');
        startKidSession();
      }
    })();
  }, [startKidSession]);

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
        if (prev === 'active' && nextAppState.match(/inactive|background/)) {
          await axios.post(`${API_BASE_URL}/api/notifications/app-background`, {
            userId: user._id,
            role: 'kid',
            action: 'start',
          });
        }

        if (prev.match(/inactive|background/) && nextAppState === 'active') {
          const { data } = await axios.get(`${API_BASE_URL}/api/screen-time/${user._id}`);
          const rec = data?.data;

          if (rec?.sessionEndTime && moment().isSameOrAfter(moment(rec.sessionEndTime))) {
            await axios.post(`${API_BASE_URL}/api/screen-time/lock-session`, {
              userId: user._id,
              sessionEnded: true,
            });
            enforceLockUI();
          }

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

  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      if (!nextSessionTime || isDailyLimitReached) return;

      const interval = setInterval(() => {
        const now = moment();
        const diff = nextSessionTime.diff(now);

        if (diff <= 0) {
          setTimeLeft('Starting soon...');
          return;
        }

        const duration = moment.duration(diff);
        const minutes = Math.floor(duration.asMinutes());
        const seconds = duration.seconds();

        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    if (!nextSessionTime || !timeLeft || isDailyLimitReached) return null;

    return (
      <View style={styles.timerContainer}>
        <MaterialCommunityIcons name="clock-outline" size={20} color="#FFCF25" />
        <Text style={styles.timerText}>Next session in: {timeLeft}</Text>
      </View>
    );
  };

  return (
    <SessionContext.Provider value={{ startKidSession }}>
      {children}

      {lockVisible && includedScreens.includes(navigationRef.current?.getCurrentRoute()?.name) && (
        <Modal transparent visible animationType="none">
          <View style={styles.overlay}>
            <Animated.View 
              style={[
                styles.card,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.starsContainer}>
                <Animated.View style={[styles.star, styles.star1, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="star" size={24} color="#FFCF25" />
                </Animated.View>
                <Animated.View style={[styles.star, styles.star2, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="star" size={16} color="#FFCF25" />
                </Animated.View>
                <Animated.View style={[styles.star, styles.star3, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="star" size={20} color="#FFCF25" />
                </Animated.View>
              </View>

              <View style={styles.iconWrap}>
                <View style={styles.iconOuter}>
                  <Animated.View style={[styles.iconInner, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialCommunityIcons name="sleep" size={50} color="#fff" />
                  </Animated.View>
                </View>
              </View>

              <Text style={styles.title}>Time to Break!</Text>
              
              <Text style={styles.msg}>{lockReason || 'Great job playing! Time for a break.'}</Text>

              {nextSessionTime && !isDailyLimitReached && <CountdownTimer />}

              <View style={styles.decorativeBar}>
                <View style={[styles.dot, { backgroundColor: '#EF3349' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFCF25' }]} />
                <View style={[styles.dot, { backgroundColor: '#2BCB9A' }]} />
                <View style={[styles.dot, { backgroundColor: '#EF3349' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFCF25' }]} />
              </View>

              <TouchableOpacity style={styles.btn} onPress={backToLogin}>
                <Ionicons name="exit-outline" size={22} color="#fff" />
                <Text style={styles.btnTxt}>Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
    </SessionContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)' 
  },
  card: { 
    width: '85%', 
    maxWidth: 400,
    backgroundColor: '#fff', 
    borderRadius: 32, 
    alignItems: 'center', 
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 40,
    left: 30,
  },
  star2: {
    top: 60,
    right: 40,
  },
  star3: {
    bottom: 100,
    left: 50,
  },
  iconWrap: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#FFF5F5',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: -70,
    shadowColor: '#EF3349',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 51, 73, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF3349',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#EF3349', 
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  msg: { 
    fontSize: 17, 
    color: '#555', 
    textAlign: 'center', 
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 207, 37, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#FFCF25',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  decorativeBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  btn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2BCB9A', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 25, 
    marginTop: 8,
    shadowColor: '#2BCB9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnTxt: { 
    color: '#fff', 
    marginLeft: 10, 
    fontSize: 17, 
    fontWeight: '700',
  },
});

export default SessionProvider;