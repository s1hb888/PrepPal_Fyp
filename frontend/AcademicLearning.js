import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const subjects = [
  { id: '1', name: 'Alphabets' },
  { id: '2', name: 'Numbers' },
  { id: '3', name: 'Shapes' },
  { id: '4', name: 'Colors' },
  { id: '5', name: 'Animals' },
  { id: '6', name: 'Fruits' },
  { id: '7', name: 'Vegetables' },
  { id: '8', name: 'Basic Words' },
];

const AcademicLearning = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Academic Learning</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subjectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
  },
  subjectText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AcademicLearning;
