import React, { useState } from 'react';
import ProfileStyles from '../Styles/Profile';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const Profile = () => {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleUpdateProfile = () => {
    if (!parentName || !email) {
      Alert.alert('Error', 'Parent name and email are required.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format. Please enter a valid email address.');
      return;
    }
    if (password && !validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long and include an uppercase letter, a digit, and a special character.');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleUpdateKidProfile = () => {
    if (!kidName || !kidAge) {
      Alert.alert('Error', 'Please enter your kid’s name and age.');
      return;
    }
    Alert.alert('Success', 'Kid’s profile updated successfully!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This will remove all data permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => Alert.alert('Deleted', 'Account deleted successfully!') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Profile</Text>
      <TextInput style={styles.input} placeholder="Parent Name" value={parentName} onChangeText={setParentName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="New Password (Optional)" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Kid’s Profile</Text>
      <TextInput style={styles.input} placeholder="Kid's Name" value={kidName} onChangeText={setKidName} />
      <TextInput style={styles.input} placeholder="Kid's Age" value={kidAge} onChangeText={setKidAge} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={handleUpdateKidProfile}>
        <Text style={styles.buttonText}>Update Kid’s Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;