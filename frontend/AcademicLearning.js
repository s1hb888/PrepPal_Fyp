import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const subjects = [
  { id: '1', name: 'Animals', icon: require('../assets/animal.png'), color: ['#f7b733', '#fc4a1a'] },
  { id: '2', name: 'Birds', icon: require('../assets/bird.png'), color: ['#4facfe', '#00f2fe'] },
  { id: '3', name: 'Numbers', icon: require('../assets/numbers.png'), color: ['#56ab2f', '#a8e063'] },
  { id: '4', name: 'Alphabets', icon: require('../assets/alphabets.png'), color: ['#ff9966', '#ff5e62'] },
  { id: '5', name: 'Fruits', icon: require('../assets/fruits.png'), color: ['#00c6ff', '#0072ff'] },
  { id: '6', name: 'Vegetables', icon: require('../assets/vegetable.png'), color: ['#f857a6', '#ff5858'] },
  { id: '7', name: 'Colors', icon: require('../assets/color.png'), color: ['#43cea2', '#185a9d'] },
  { id: '8', name: 'Flowers', icon: require('../assets/flower.png'), color: ['#f7971e', '#ffd200'] },
  { id: '9', name: 'Organs', icon: require('../assets/human-organs.png'), color: ['#654ea3', '#eaafc8'] },
  { id: '10', name: 'Shapes', icon: require('../assets/shapes.png'), color: ['#3a1c71', '#d76d77'] },
  { id: '11', name: 'Vehicles', icon: require('../assets/car.png'), color: ['#36d1dc', '#5b86e5'] },
  { id: '12', name: 'Maths', icon: require('../assets/tools.png'), color: ['#f12711', '#f5af19'] },
];

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color[0] }]}
      onPress={() => item.name === 'Alphabets' && navigation.navigate('AlphabetsScreen')}>
      <View style={styles.row}>
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good evening</Text>
      <Text style={styles.kids}>Kids</Text>

      <FlatList
        data={subjects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fefefe',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '500',
    color: '#444',
  },
  kids: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff4081',
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  icon: {
    width: 60,
    height: 60,
  },
});

export default HomeScreen;
