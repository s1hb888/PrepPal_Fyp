import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from './config';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and Password are required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      console.log('Response from server:', data); 
      if (response.ok) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', data.token);
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Stored Token:', storedToken);


        Alert.alert('Success', 'Login successful!');

        if (role === 'parent') {
          navigation.navigate('Home');
        } else if (role === 'kid') {
          navigation.navigate('KidHome');
        }
      } else {
        Alert.alert('Error', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server error, please try again later.');
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
      <Text style={styles.title}>Login</Text>
      
      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Login as:</Text>
        <View style={styles.radioOption}>
          <RadioButton
            value="parent"
            status={role === 'parent' ? 'checked' : 'unchecked'}
            onPress={() => setRole('parent')}
            color="#EF3349"
          />
          <Text>Parent</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton
            value="kid"
            status={role === 'kid' ? 'checked' : 'unchecked'}
            onPress={() => setRole('kid')}
            color="#EF3349"
          />
          <Text>Kid</Text>
        </View>
      </View>
      
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
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.loginTextData}>Don't Have an Account? Signup</Text>
      </TouchableOpacity>
    </View>
  );
};


const updateProfile = async (data) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    return Alert.alert('Error', 'You must be logged in to update profile.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Server error, please try again later.');
  }
};

const deleteAccount = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    return Alert.alert('Error', 'You must be logged in to delete your account.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      Alert.alert('Success', 'Account deleted successfully');
      // Clear stored token after deleting account
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', result.message || 'Failed to delete account');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Server error, please try again later.');
  }
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
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 16,
    marginRight: 10,
  },
 
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
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
    color: '#333',
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
  loginTextData: {
    marginTop: 20,
    color: '#EF3349',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Login;
