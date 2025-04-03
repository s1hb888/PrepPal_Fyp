import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');

  const handleLogin = () => {
    if (email === '1' && password === '1' && role === 'parent') {
      Alert.alert('Success', 'Login successful as Parent!');
      navigation.navigate('parentHome');
    } else if (email === '1' && password === '1' && role === 'kid') {
      Alert.alert('Success', 'Login successful as Kid!');
      navigation.navigate('kidHome');
    } else {
      Alert.alert('Error', 'Invalid email or password.');
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
            style={styles.radioButton}
            value="parent"
            status={role === 'parent' ? 'checked' : 'unchecked'}
            onPress={() => setRole('parent')}
            color="#EF3349"
          />
          <Text>Parent</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton
            value="child"
            status={role === 'kid' ? 'checked' : 'unchecked'}
            onPress={() => setRole('kid')}
            color="#EF3349"
          />
          <Text>Child</Text>
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
