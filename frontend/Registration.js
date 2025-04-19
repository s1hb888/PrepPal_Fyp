import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from './config';

const Registration = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleRegister = async () => {
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

    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        email,
        password,
        kidName,
        kidAge
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('Login');  // Navigate to login screen
      }
    } catch (error) {
      if (error.response) {
        // If response is available, show specific error message
        Alert.alert('Error', error.response.data.message || 'Registration failed. Please try again.');
      } else {
        // Handle errors with no response (e.g., network issues)
        Alert.alert('Error', 'Server error, please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
      <Text style={styles.title}>Register</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Kid's Name"
          value={kidName}
          onChangeText={setKidName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="calendar" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Kid's Age"
          value={kidAge}
          onChangeText={setKidAge}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  appBar: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2BCB9A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    color: '#EF3349',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Registration;
