import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Home = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to PrepPal</Text>

      {/* Academic Learning */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AcademicLearning')}>
        <FontAwesome name="book" size={30} color="#4CAF50" />
        <Text style={styles.cardText}>Academic Learning</Text>
      </TouchableOpacity>

      {/* Assessments */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Assessments')}>
        <FontAwesome name="pencil" size={30} color="#FFA500" />
        <Text style={styles.cardText}>Assessments</Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profile')}>
        <FontAwesome name="user" size={30} color="#007BFF" />
        <Text style={styles.cardText}>Profile</Text>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Settings')}>
        <FontAwesome name="cog" size={30} color="#FF4500" />
        <Text style={styles.cardText}>Settings</Text>
      </TouchableOpacity>

      {/* Account Management */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AccountManagement')}>
        <FontAwesome name="lock" size={30} color="#800080" />
        <Text style={styles.cardText}>Account Management</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
});

export default Home;
