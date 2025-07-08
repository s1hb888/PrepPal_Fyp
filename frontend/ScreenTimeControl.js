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
      <Feather name="minus" size={18} color={RED} />
    </TouchableOpacity>
    <TextInput
      style={styles.stepInput}
      keyboardType="numeric"
      value={value}
      onChangeText={setValue}
      maxLength={3}
    />
    <TouchableOpacity
      style={styles.stepBtn}
      onPress={() => setValue(Math.min(max, (+value || 0) + 1).toString())}
    >
      <Feather name="plus" size={18} color={RED} />
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
        setGapHours((Math.floor((d.nextSessionGap || 0) / 60)).toString());
        setNotificationsEnabled(d.notificationsEnabled ?? true);
      }
    } catch (e) { console.log(e); }
  };

  const saveSettings = async () => {
    if (!validate()) return;
    const nextSessionGap = (+gapMinutes || 0) + ((+gapHours || 0) * 60);
    try {
      const res = await fetch(`${API_BASE_URL}/api/screen-time/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dailyUsageLimit: +dailyUsageLimit,
          sessionDuration: +sessionDuration,
          totalDailyTime: +totalDailyTime,
          nextSessionGap,
          notificationsEnabled,
        }),
      });
      if (res.ok) setShowSuccessModal(true);
    } catch (e) { console.log('save error', e); }
  };

  const validate = () => {
    const err = {};
    let ok = true;
    const d = +dailyUsageLimit, s = +sessionDuration, t = +totalDailyTime;
    if (!d) { err.daily = 'Required'; ok = false; }
    if (!s) { err.session = 'Required'; ok = false; }
    if (!t) { err.total = 'Required'; ok = false; }
    if (ok && s >= t) { err.session = 'Session < total'; ok = false; }
    if (ok && s * d !== t) { err.total = 'Total = session × opens'; ok = false; }
    setErrors(err); return ok;
  };

  const handleAppChange = (next) => { appState.current = next; };

  const checkSessionLock = async () => {
    const locked = await AsyncStorage.getItem('isLocked');
    if (locked === 'true') navigation.replace('LockedScreen');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Screen‑Time Limits</Text>

        <View style={styles.card}>
          <View style={styles.rowCenter}><Ionicons name="time-outline" size={20} color={RED} /><Text style={styles.cardLabel}>App Opens per Day</Text></View>
          <Stepper value={dailyUsageLimit} setValue={setDailyUsageLimit} min={1} />
          {errors.daily && <Text style={styles.error}>{errors.daily}</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.rowCenter}><MaterialIcons name="hourglass-top" size={20} color={RED} /><Text style={styles.cardLabel}>Session Duration (min)</Text></View>
          <Stepper value={sessionDuration} setValue={setSessionDuration} min={1} />
          {errors.session && <Text style={styles.error}>{errors.session}</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.rowCenter}><Ionicons name="calendar-outline" size={20} color={RED} /><Text style={styles.cardLabel}>Total Daily Time (min)</Text></View>
          <TextInput style={styles.input} keyboardType="numeric" value={totalDailyTime} onChangeText={setTotalDailyTime} />
          {errors.total && <Text style={styles.error}>{errors.total}</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.rowCenter}><MaterialIcons name="timer" size={20} color={RED} /><Text style={styles.cardLabel}>Gap Between Sessions</Text></View>
          <View style={styles.gapRow}>
            <TextInput style={[styles.input, { flex:1, marginRight:8 }]} placeholder="Hours" keyboardType="numeric" value={gapHours} onChangeText={setGapHours} />
            <TextInput style={[styles.input, { flex:1 }]} placeholder="Minutes" keyboardType="numeric" value={gapMinutes} onChangeText={setGapMinutes} />
          </View>
        </View>

        <TouchableOpacity style={styles.toggleCard} activeOpacity={0.9} onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
          <Ionicons name="notifications-outline" size={20} color={RED} />
          <Text style={[styles.cardLabel, { flex:1, marginLeft:8 }]}>Notify if app closed early</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false:'#ccc', true:MINT }} thumbColor={notificationsEnabled ? MINT : '#f4f4f4'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}><Text style={styles.saveText}>Save Settings</Text></TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Feather name="check-circle" size={42} color={RED} />
            <Text style={styles.modalMsg}>Settings Saved!</Text>
            <TouchableOpacity style={styles.modalOk} onPress={()=>setShowSuccessModal(false)}><Text style={styles.modalOkText}>OK</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ScreenTimeControl;

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff' },
  scrollContainer:{ padding:16, paddingBottom:30 },
  title:{ fontSize:22, fontWeight:'700', color:TEXT, marginTop:40, marginBottom:16, textAlign:'center' },
  card:{ backgroundColor:'#fff', borderRadius:16, padding:14, marginBottom:18, borderWidth:1, borderColor:'#eee', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  rowCenter:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  cardLabel:{ fontSize:15, fontWeight:'600', color:TEXT, marginLeft:6 },
  stepperWrap:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:6 },
  stepBtn:{ backgroundColor:MINT, paddingHorizontal:14, paddingVertical:6, borderRadius:8, justifyContent:'center', alignItems:'center' },
  stepInput:{ backgroundColor:'#F4F4F4', borderRadius:8, paddingVertical:6, paddingHorizontal:10, fontSize:14, color:TEXT, textAlign:'center', width:60 },
  input:{ backgroundColor:'#F4F4F4', borderRadius:8, paddingVertical:8, paddingHorizontal:12, fontSize:14, color:TEXT, marginTop:6 },
  gapRow:{ flexDirection:'row', marginTop:6 },
  toggleCard:{ flexDirection:'row', alignItems:'center', borderRadius:16, padding:14, borderWidth:1, borderColor:'#eee', marginBottom:28 },
  saveBtn:{ backgroundColor:MINT, borderRadius:30, paddingVertical:14, alignItems:'center', marginHorizontal:60, marginBottom:30, elevation:2 },
  saveText:{ color:TEXT, fontWeight:'700', fontSize:16 },
  error:{ color:RED, fontSize:12, marginTop:4 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', alignItems:'center' },
  modalCard:{ backgroundColor:'#fff', width:'75%', borderRadius:20, padding:24, alignItems:'center' },
  modalMsg:{ fontSize:16, fontWeight:'600', color:TEXT, marginVertical:14 },
  modalOk:{ backgroundColor:MINT, paddingVertical:10, paddingHorizontal:28, borderRadius:24 },
  modalOkText:{ fontWeight:'700', color:TEXT },
});