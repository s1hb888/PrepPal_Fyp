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
  ScrollView,
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
      {/* Reduced size: 16 */}
      <Feather name="minus" size={16} color={RED} /> 
    </TouchableOpacity>
    <View style={styles.stepInputContainer}>
      <TextInput
        style={styles.stepInput}
        keyboardType="numeric"
        value={value}
        onChangeText={(val) => {
          if (/^\d*$/.test(val)) setValue(val);
        }}
        maxLength={3}
      />
    </View>
    <TouchableOpacity
      style={styles.stepBtn}
      onPress={() => setValue(Math.min(max, (+value || 0) + 1).toString())}
    >
      {/* Reduced size: 16 */}
      <Feather name="plus" size={16} color={RED} /> 
    </TouchableOpacity>
  </View>
);

const ScreenTimeControl = () => {
  const [userId, setUserId] = useState('');
  const [dailyUsageLimit, setDailyUsageLimit] = useState(''); 
  const [sessionDuration, setSessionDuration] = useState('');
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIconOuter}>
              <View style={styles.headerIcon}>
                <Ionicons name="shield-checkmark" size={32} color="#fff" />
              </View>
            </View>
          </View>
          <Text style={styles.title}>Screen Time Control</Text>
          <Text style={styles.subtitle}>
            Set healthy digital boundaries for your child's wellbeing
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Daily Usage Card */}
          <View style={styles.settingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="calendar-outline" size={20} color={RED} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Daily Screen Time Limit (min)</Text>
                <Text style={styles.cardDescription}>
                  Maximum minutes of total app usage allowed per day
                </Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Stepper value={dailyUsageLimit} setValue={setDailyUsageLimit} min={1} />
            </View>
            {errors.daily && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={12} color={RED} />
                <Text style={styles.errorText}>{errors.daily}</Text>
              </View>
            )}
          </View>

          {/* Session Duration Card */}
          <View style={styles.settingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <MaterialIcons name="av-timer" size={20} color={RED} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Session Duration (min)</Text>
                <Text style={styles.cardDescription}>
                  Maximum minutes for a single active session
                </Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Stepper value={sessionDuration} setValue={setSessionDuration} min={1} />
            </View>
            {errors.session && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={12} color={RED} />
                <Text style={styles.errorText}>{errors.session}</Text>
              </View>
            )}
          </View>

          {/* Session Gap Card - Updated Label/Description */}
          <View style={styles.settingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <MaterialIcons name="schedule" size={20} color={RED} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Session Gap</Text>
                <Text style={styles.cardDescription}>
                  Minimum time required between the end of one session and the start of the next
                </Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.gapInputsContainer}>
                <View style={styles.gapInputWrapper}>
                  <Text style={styles.inputLabel}>Hours</Text>
                  <TextInput
                    style={styles.gapInput}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={gapHours}
                    onChangeText={(val) => {
                      if (/^\d*$/.test(val)) setGapHours(val);
                    }}
                  />
                  <Text style={styles.inputUnit}>hrs</Text>
                </View>
                <View style={styles.gapSeparator}>
                  <Text style={styles.gapSeparatorText}>:</Text>
                </View>
                <View style={styles.gapInputWrapper}>
                  <Text style={styles.inputLabel}>Minutes*</Text>
                  <TextInput
                    style={styles.gapInput}
                    placeholder="30"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={gapMinutes}
                    onChangeText={(val) => {
                      if (/^\d*$/.test(val)) setGapMinutes(val);
                    }}
                  />
                  <Text style={styles.inputUnit}>min</Text>
                </View>
              </View>
            </View>
            {errors.gap && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={12} color={RED} />
                <Text style={styles.errorText}>{errors.gap}</Text>
              </View>
            )}
          </View>

          {/* Notifications Toggle Card - Updated Label/Description */}
          <View style={styles.settingCard}>
            <TouchableOpacity
              style={styles.toggleContent}
              activeOpacity={0.8}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <View style={styles.toggleLeft}>
                <View style={styles.iconBadge}>
                  <Ionicons name="notifications-outline" size={20} color={RED} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>App Background</Text>
                  <Text style={styles.cardDescription}>
                    Get notified if the app is sent to the background
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: MINT }}
                thumbColor={notificationsEnabled ? '#fff' : '#fff'}
                ios_backgroundColor="#E0E0E0"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <View style={styles.saveButtonContent}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Changes take effect immediately
          </Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                {/* CHANGE MADE HERE: 
                  Icon color changed from {MINT} (light green) to {RED} 
                */}
                <Feather name="check" size={40} color={RED} /> 
              </View>
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              Your screen time settings have been saved and are now active.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ScreenTimeControl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Header Section
  headerSection: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${RED}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Setting Cards
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${RED}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
    paddingTop: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  cardContent: {
    marginTop: 4,
  },

  // Stepper (Reduced Size)
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12, // Reduced border radius
    padding: 4, // Reduced padding
  },
  stepBtn: {
    backgroundColor: MINT,
    width: 36, // Reduced width
    height: 36, // Reduced height
    borderRadius: 10, // Reduced border radius
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.2, // Reduced shadow
    shadowRadius: 3, // Reduced shadow
    elevation: 2,
  },
  stepInputContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInput: {
    backgroundColor: '#fff',
    borderRadius: 10, // Reduced border radius
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 16, // Reduced padding
    fontSize: 20, // Reduced font size
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    minWidth: 70, // Reduced min width
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },

  // Gap Inputs (Reduced Size)
  gapInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12, // Reduced border radius
    padding: 12, // Reduced padding
  },
  gapInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10, // Reduced font size
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6, // Reduced margin
  },
  gapInput: {
    backgroundColor: '#fff',
    borderRadius: 10, // Reduced border radius
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 14, // Reduced padding
    fontSize: 18, // Reduced font size
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 4, // Reduced margin
  },
  inputUnit: {
    fontSize: 11, // Reduced font size
    fontWeight: '600',
    color: '#666',
  },
  gapSeparator: {
    marginHorizontal: 10, // Reduced margin
    paddingTop: 16, // Reduced padding
  },
  gapSeparatorText: {
    fontSize: 22, // Reduced font size
    fontWeight: '700',
    color: '#CCC',
  },

  // Toggle
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Footer Section
  footerSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: RED,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    maxWidth: 400,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // Background remains MINT for contrast
    backgroundColor: `${MINT}20`, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: MINT,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
});