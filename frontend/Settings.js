import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Settings = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <TouchableOpacity style={styles.option} onPress={() => alert('Change Password Clicked')}>
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option} onPress={() => alert('Manage Notifications Clicked')}>
        <Text style={styles.optionText}>Manage Notifications</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option} onPress={() => alert('Privacy Settings Clicked')}>
        <Text style={styles.optionText}>Privacy Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option} onPress={() => alert('Language Preferences Clicked')}>
        <Text style={styles.optionText}>Language Preferences</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.optionText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  option: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Settings;
