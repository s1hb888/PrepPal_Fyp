import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config';
import { SessionContext } from '../SessionContext';

const MINT = 'rgb(160,240,220)';
const RED = '#EF3349';
const TEXT = '#000000';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [lockReason, setLockReason] = useState('');

  const { startKidSession } = useContext(SessionContext);

  const handleLogin = async () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required. Please enter your registered email address.';
    if (!password.trim()) newErrors.password = 'Password is required.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.user._id.toString());
        await AsyncStorage.setItem('user', JSON.stringify({ ...data.user, role }));

        if (role === 'kid') {
          const screenTimeRes = await fetch(`${API_BASE_URL}/api/screen-time/${data.user._id}`);
          const screenTimeData = await screenTimeRes.json();

          if (screenTimeData.success && screenTimeData.data.isLocked) {
            const reason =
              screenTimeData.data.usageCountToday >= screenTimeData.data.dailyUsageLimit
                ? 'App opens per day limit reached.'
                : 'Total screen time for today has ended.';
            setLockReason(reason);
            setLockModalVisible(true);
            return;
          }

          await AsyncStorage.setItem('isLocked', 'false');
          startKidSession();
        }

        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate(role === 'parent' ? 'Home' : 'KidHome');
        }, 2000);

      } else {
        setErrorMessage(data.message || 'Invalid credentials');
        setErrorModalVisible(true);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server error, please try again later.');
    }
  };

  return (
    <View style={[styles.gradientBackground]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color={RED} />
          </TouchableOpacity>
        </View>

        <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.title}>Login</Text>

        <View style={styles.radioRowInline}>
          <Text style={styles.radioLabel}>Login as:</Text>
          <View style={styles.radioOption}>
            <RadioButton
              value="parent"
              status={role === 'parent' ? 'checked' : 'unchecked'}
              onPress={() => setRole('parent')}
              color={RED}
            />
            <Text style={styles.radioText}>Parent</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton
              value="kid"
              status={role === 'kid' ? 'checked' : 'unchecked'}
              onPress={() => setRole('kid')}
              color={RED}
            />
            <Text style={styles.radioText}>Kid</Text>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color={RED} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={RED} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={RED} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Password reset process initiated.')}> 
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: MINT }]}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.signupText}>
            Don’t have an account? <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        {successModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.successModal}>
                <Ionicons name="checkmark-circle-outline" size={60} color={MINT} />
                <Text style={styles.successTitle}>Login Successful!</Text>
                <Text style={styles.successText}>Redirecting...</Text>
              </View>
            </View>
          </Modal>
        )}

        {errorModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.errorModal}>
                <Ionicons name="alert-circle-outline" size={60} color={RED} />
                <Text style={styles.errorTitle}>Login Failed</Text>
                <Text style={styles.errorTextModal}>{errorMessage}</Text>
                <TouchableOpacity onPress={() => setErrorModalVisible(false)} style={[styles.dismissButton, { backgroundColor: RED }]}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {lockModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.errorModal}>
                <Ionicons name="lock-closed-outline" size={60} color={RED} />
                <Text style={styles.errorTitle}>Screen Time Limit Reached</Text>
                <Text style={styles.errorTextModal}>{lockReason}</Text>
                <TouchableOpacity onPress={() => setLockModalVisible(false)} style={[styles.dismissButton, { backgroundColor: RED }]}>
                  <Text style={styles.dismissText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  appBar: { position: 'absolute', top: 40, left: 20 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: TEXT, marginBottom: 20 },
  radioRowInline: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  radioLabel: { fontSize: 16, color: TEXT, marginRight: 10 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  radioText: { color: TEXT },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 10, marginBottom: 8, height: 50 },
  input: { flex: 1, fontSize: 16, color: TEXT },
  icon: { marginRight: 8 },
  errorText: { color: 'red', fontSize: 12, marginLeft: 5, marginBottom: 5 },
  forgotPassword: { color: RED, textAlign: 'right', marginTop: 8, marginBottom: 8, textDecorationLine: 'underline' },
  button: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 18, marginTop: 10 },
  buttonText: { color: TEXT, fontWeight: 'bold', fontSize: 16 },
  signupText: { textAlign: 'center', fontSize: 14, color: TEXT },
  signupLink: { color: RED, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  successModal: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '80%', alignItems: 'center', elevation: 5 },
  successTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  successText: { fontSize: 14, color: '#333', marginTop: 5, textAlign: 'center' },
  errorModal: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '80%', alignItems: 'center', elevation: 5 },
  errorTitle: { fontSize: 20, color: RED, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  errorTextModal: { fontSize: 14, color: '#333', marginTop: 5, textAlign: 'center' },
  dismissButton: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  dismissText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default Login;
