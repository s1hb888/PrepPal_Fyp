import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you install @expo/vector-icons

const Registration = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleRegister = () => {
    if (!email || !validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }
    if (!password || !validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long and contain an uppercase letter, a digit, and a special character.');
      return;
    }
    if (!kidName || !kidAge) {
      Alert.alert('Error', "Kid’s name and age are required.");
      return;
    }
    Alert.alert('Success', 'Registration successful!');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Register</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#555" />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#555" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#555" />
        <TextInput style={styles.input} placeholder="Kid's Name" value={kidName} onChangeText={setKidName} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="calendar" size={20} color="#555" />
        <TextInput style={styles.input} placeholder="Kid's Age" value={kidAge} onChangeText={setKidAge} keyboardType="numeric" />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already registered? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c70ec',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#fe7100',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
  },
  loginButton: {
    marginTop: 20,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Registration;