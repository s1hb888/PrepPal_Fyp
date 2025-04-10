
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const assessments = [
  { id: '1', title: 'Math Quiz', icon: 'calculator-variant', color: '#f57c00' },
  { id: '2', title: 'Alphabet Test', icon: 'alphabet-aurebesh', color: '#7b1fa2' },
  { id: '3', title: 'Shapes & Colors', icon: 'shape-outline', color: '#0288d1' },
  { id: '4', title: 'General Knowledge', icon: 'lightbulb-on-outline', color: '#388e3c' },
];

const Assessments = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.assessmentItem, { backgroundColor: item.color }]}
      onPress={() => alert(`${item.title} selected`)}>
      <View style={styles.row}>
        <Icon name={item.icon} size={30} color="#fff" style={styles.icon} />
        <Text style={styles.assessmentText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessments</Text>
      <FlatList
        data={assessments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fefefe',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#444',
  },
  assessmentItem: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessmentText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 16,
  },
  icon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 8,
    borderRadius: 50,
  },
});

export default Assessments;
