import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const assessments = [
  { id: '1', title: 'Math Quiz' },
  { id: '2', title: 'Alphabet Test' },
  { id: '3', title: 'Shapes & Colors' },
  { id: '4', title: 'General Knowledge' },
];

const Assessments = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.assessmentItem} onPress={() => alert(`${item.title} selected`)}>
      <Text style={styles.assessmentText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessments</Text>
      <FlatList
        data={assessments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  assessmentItem: {
    backgroundColor: '#4CAF50',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  assessmentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Assessments;