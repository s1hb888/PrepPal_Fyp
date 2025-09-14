import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  AppState,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import API_BASE_URL from './config';

const MINT = 'rgb(160,240,220)';
const RED = '#EF3349';
const TEXT = '#000000';

const Stepper = ({ value, setValue, min = 0, max = 999 }) => (
  <View style={styles.stepperWrap}>
    <TouchableOpacity
      style={styles.stepBtn}
      onPress={() => setValue(Math.max(min, (+value || 0) - 1).toString())}
    >
      <Feather name="minus" size={16} color={RED} />
    </TouchableOpacity>
    <TextInput
      style={styles.stepInput}
      keyboardType="numeric"
      value={value}
      onChangeText={(val) => {
        // Only digits, no negatives
        if (/^\d*$/.test(val)) setValue(val);
      }}
      maxLength={3}
    />
    <TouchableOpacity
      style={styles.stepBtn}
      onPress={() => setValue(Math.min(max, (+value || 0) + 1).toString())}
    >
      <Feather name="plus" size={16} color={RED} />
    </TouchableOpacity>
  </View>
);

const ScreenTimeControl = () => {
  const [userId, setUserId] = useState('');
  const [dailyUsageLimit, setDailyUsageLimit] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [totalDailyTime, setTotalDailyTime] = useState('');
  const [gapMinutes, setGapMinutes] = useState('');
  const [gapHours, setGapHours] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user._id);
        fetchScreenTime(user._id);
      }
    })();

    const sub = AppState.addEventListener('change', handleAppChange);
    checkSessionLock();
    return () => sub.remove();
  }, []);

  const fetchScreenTime = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/screen-time/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setDailyUsageLimit(d.dailyUsageLimit?.toString() || '');
        setSessionDuration(d.sessionDuration?.toString() || '');
        setTotalDailyTime(d.totalDailyTime?.toString() || '');
        setGapMinutes(((d.nextSessionGap || 0) % 60).toString());
        setGapHours(Math.floor((d.nextSessionGap || 0) / 60).toString());
        setNotificationsEnabled(d.notificationsEnabled ?? true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveSettings = async () => {
    if (!validate()) return;
    const nextSessionGap = (+gapMinutes || 0) + (+gapHours || 0) * 60;
    try {
      const res = await fetch(`${API_BASE_URL}/api/screen-time/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dailyUsageLimit: +dailyUsageLimit,
          sessionDuration: +sessionDuration,
          nextSessionGap,
          notificationsEnabled,
        }),
      });
      if (res.ok) setShowSuccessModal(true);
    } catch (e) {
      console.log('save error', e);
    }
  };

  const validate = () => {
    const err = {};
    let ok = true;

    if (!+dailyUsageLimit) {
      err.daily = 'Required';
      ok = false;
    }
    if (!+sessionDuration) {
      err.session = 'Required';
      ok = false;
    }

    // Gap validation
    if (!gapMinutes) {
      err.gap = 'Minutes required';
      ok = false;
    } else if (!/^\d+$/.test(gapMinutes) || +gapMinutes < 0) {
      err.gap = 'Only positive numbers allowed';
      ok = false;
    }

    if (gapHours && (!/^\d+$/.test(gapHours) || +gapHours < 0)) {
      err.gap = 'Only positive numbers allowed';
      ok = false;
    }

    setErrors(err);
    return ok;
  };

  const handleAppChange = (next) => {
    appState.current = next;
  };

  const checkSessionLock = async () => {
    const locked = await AsyncStorage.getItem('isLocked');
    if (locked === 'true') navigation.replace('LockedScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.fixedContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-outline" size={26} color="#fff" />
          </View>
          <Text style={styles.title}>Screen-Time Limits</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          Manage your kid's digital wellbeing. Set healthy boundaries.
        </Text>

        {/* Daily Usage Limit */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <Ionicons name="time-outline" size={18} color={RED} />
            <Text style={styles.cardLabel}>App Opens per Day</Text>
          </View>
          <Stepper value={dailyUsageLimit} setValue={setDailyUsageLimit} min={1} />
          {errors.daily && <Text style={styles.error}>{errors.daily}</Text>}
        </View>

        {/* Session Duration */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <MaterialIcons name="hourglass-top" size={18} color={RED} />
            <Text style={styles.cardLabel}>Session Duration (min)</Text>
          </View>
          <Stepper value={sessionDuration} setValue={setSessionDuration} min={1} />
          {errors.session && <Text style={styles.error}>{errors.session}</Text>}
        </View>

        {/* Gap */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <MaterialIcons name="timer" size={18} color={RED} />
            <Text style={styles.cardLabel}>Gap Between Sessions</Text>
          </View>
          <View style={styles.gapRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 6 }]}
              placeholder="Hours (optional)"
              keyboardType="numeric"
              value={gapHours}
              onChangeText={(val) => {
                if (/^\d*$/.test(val)) setGapHours(val);
              }}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Minutes *"
              keyboardType="numeric"
              value={gapMinutes}
              onChangeText={(val) => {
                if (/^\d*$/.test(val)) setGapMinutes(val);
              }}
            />
          </View>
          {errors.gap && <Text style={styles.error}>{errors.gap}</Text>}
        </View>

        {/* Notifications Toggle */}
        <TouchableOpacity
          style={styles.toggleCard}
          activeOpacity={0.9}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <Ionicons name="notifications-outline" size={18} color={RED} />
          <Text style={[styles.cardLabel, { flex: 1, marginLeft: 6 }]}>
            Notify if app closed early
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: MINT }}
            thumbColor={notificationsEnabled ? MINT : '#f4f4f4'}
          />
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Feather name="check-circle" size={46} color={MINT} />
            <Text style={styles.modalMsg}>Settings Saved!</Text>
            <TouchableOpacity
              style={styles.modalOk}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ScreenTimeControl;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fixedContainer: { flex: 1, padding: 16, justifyContent: 'space-between' },

  // Header
  header: { justifyContent: 'center', alignItems: 'center', marginTop: 3 },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 10,
  },
  title: { fontSize: 25, fontWeight: '700', color: TEXT, marginBottom: 0 },
  subtitleText: {
    fontSize: 15,
    color: '#555',
    marginTop: 0,
    marginBottom: 5,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginLeft: 5 },

  // Stepper
  stepperWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    backgroundColor: MINT,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInput: {
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: TEXT,
    textAlign: 'center',
    width: 60,
    fontWeight: '600',
  },

  // Inputs
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: TEXT,
  },
  gapRow: { flexDirection: 'row', marginTop: 6 },

  // Toggle
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },

  // Save Button
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RED,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignSelf: 'center',
  },
  saveText: { marginLeft: 6, color: '#fff', fontWeight: '700', fontSize: 15 },

  error: { color: RED, fontSize: 12, marginTop: 3 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '75%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  modalMsg: { fontSize: 15, fontWeight: '600', color: TEXT, marginVertical: 10, textAlign: 'center' },
  modalOk: { backgroundColor: MINT, paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  modalOkText: { fontWeight: '700', color: '#000' },
});
