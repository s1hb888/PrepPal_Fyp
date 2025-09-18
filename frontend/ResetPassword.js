import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import API_BASE_URL from './config';

const RED = '#EF3349';
const MINT = 'rgb(160,240,220)';
const TEXT = '#000000';

const ResetPassword = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1 = request token, 2 = reset password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // ---------------- Deep Linking ----------------
  useEffect(() => {
    const handleDeepLink = (event) => {
      const data = Linking.parse(event.url);
      if (data.queryParams?.resetToken && data.queryParams?.email) {
        setEmail(data.queryParams.email);
        setToken(data.queryParams.resetToken);
        setStep(2);
      }
    };

    // Updated syntax for Linking event
    const subscription = Linking.addEventListener('url', handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink({ url: initialUrl });
    })();

    return () => subscription.remove();
  }, []);

  // ---------------- Step 1: Request Token ----------------
  const handleRequestToken = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your registered email.');

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Reset token sent to your email.');
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error, try again later.');
    }
  };

  // ---------------- Step 2: Reset Password ----------------
  const handleResetPassword = async () => {
    if (!token.trim() || !password.trim() || !confirmPassword.trim())
      return Alert.alert('Error', 'All fields are required.');

    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken: token, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('Login');
        }, 2000);
      } else {
        Alert.alert('Error', data.message || 'Invalid or expired token.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error, try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Reset Password</Text>

        {step === 1 && (
          <>
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
            <TouchableOpacity onPress={handleRequestToken} style={[styles.button, { backgroundColor: MINT }]}>
              <Text style={styles.buttonText}>Request Reset Token</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color={RED} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Reset Token"
                placeholderTextColor="#888"
                value={token}
                onChangeText={setToken}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={RED} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={RED} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={RED} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity onPress={handleResetPassword} style={[styles.button, { backgroundColor: MINT }]}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {successModalVisible && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.successModal}>
                <Ionicons name="checkmark-circle-outline" size={60} color={MINT} />
                <Text style={styles.successTitle}>Password Reset Successful!</Text>
                <Text style={styles.successText}>Redirecting to login...</Text>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: TEXT },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, height: 50 },
  input: { flex: 1, fontSize: 16, color: TEXT },
  icon: { marginRight: 8 },
  button: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  buttonText: { color: TEXT, fontWeight: 'bold', fontSize: 16 },
  backText: { textAlign: 'center', color: RED, marginTop: 10, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  successModal: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '80%', alignItems: 'center', elevation: 5 },
  successTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  successText: { fontSize: 14, color: '#333', marginTop: 5, textAlign: 'center' },
});

export default ResetPassword;
