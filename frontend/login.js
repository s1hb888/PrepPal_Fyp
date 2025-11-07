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
  KeyboardAvoidingView,
  Platform,
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
const GREEN = '#23B26D';

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
    if (!email.trim()) {
      newErrors.email = 'Email is required. Please enter your registered email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format. Please enter a valid email address.";
      }
    }
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
        if (data.user && data.user.isVerified === false) {
          setErrorMessage("Your email is not verified. Please check your email and verify your account using the link sent to you.");
          setErrorModalVisible(true);
          return;
        }

        if (data.user && data.user.isActive === false) {
          setErrorMessage("Your account is deactivated. Please contact support for assistance.");
          setErrorModalVisible(true);
          return;
        }

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
        if (data.message === "Email not registered") {
          setErrorMessage("This email is not registered. Please create an account.");
        } else if (data.message === "Invalid credentials") {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (data.message === "Account deactivated") {
          setErrorMessage("Your account is deactivated. Please contact support for assistance.");
        } else {
          setErrorMessage(data.message || "Invalid credentials");
        }
        setErrorModalVisible(true);
      }

    } catch (error) {
      console.error(error);
      setErrorMessage('Server error. Please try again later.');
      setErrorModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.gradientBackground}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
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

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: MINT }]}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        {/* Success Modal */}
        {successModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.professionalModal}>
                <View style={styles.iconCircleContainer}>
                  <LinearGradient
  colors={['#A0F0DC', '#7BE7CE']}
  style={styles.successIconCircle}
>
  <Ionicons name="checkmark" size={50} color="#fff" />
</LinearGradient>

                </View>

                <Text style={styles.professionalTitle}>Login Successful!</Text>
                <Text style={styles.professionalMessage}>Welcome back! Redirecting you now...</Text>
              </View>
            </View>
          </Modal>
        )}

        {/* Error Modal */}
        {errorModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.professionalModal}>
                <View style={styles.iconCircleContainer}>
                  <LinearGradient
                    colors={[RED, '#D12A3D']}
                    style={styles.errorIconCircle}
                  >
                    <Ionicons name="close" size={50} color="#fff" />
                  </LinearGradient>
                </View>

                <Text style={styles.professionalTitle}>Login Failed</Text>
                <Text style={styles.professionalMessage}>{errorMessage}</Text>

                <LinearGradient
                  colors={[RED, '#D12A3D']}
                  style={styles.professionalButton}
                >
                  <TouchableOpacity
                    onPress={() => setErrorModalVisible(false)}
                    style={styles.professionalButtonTouchable}
                  >
                    <Text style={styles.professionalButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        )}

        {/* Lock Modal */}
        {lockModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.professionalModal}>
                <View style={styles.iconCircleContainer}>
                  <LinearGradient
                    colors={[RED, '#D12A3D']}
                    style={styles.errorIconCircle}
                  >
                    <Ionicons name="lock-closed" size={50} color="#fff" />
                  </LinearGradient>
                </View>

                <Text style={styles.professionalTitle}>Screen Time Limit Reached</Text>
                <Text style={styles.professionalMessage}>{lockReason}</Text>

                <LinearGradient
                  colors={[RED, '#D12A3D']}
                  style={styles.professionalButton}
                >
                  <TouchableOpacity
                    onPress={() => setLockModalVisible(false)}
                    style={styles.professionalButtonTouchable}
                  >
                    <Text style={styles.professionalButtonText}>OK</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20 },
  professionalModal: { backgroundColor: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 380, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  iconCircleContainer: { marginBottom: 24 },
  successIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  errorIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  professionalTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 12 },
  professionalMessage: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 },
  professionalButton: { width: '100%', borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  professionalButtonTouchable: { width: '100%', paddingVertical: 16, alignItems: 'center' },
  professionalButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default Login;
