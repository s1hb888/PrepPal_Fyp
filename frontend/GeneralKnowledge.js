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

  {
    id: '1',
    name: 'Vowels',
    icon: require('../assets/vowel.png'),
    color: ['#EF3349', '#EF3349'],
    screen: 'VowelsScreen',
  },
  {
    id: '5',
    name: 'Fruits',
    icon: require('../assets/fruits.png'),
    color: ['#2BCB9A', '#2BCB9A'],
    screen: 'FruitsScreen',
  },
  {
    id: '6',
    name: 'Vegetables',
    icon: require('../assets/vegetable.png'),
    color: ['#FFCF25', '#FFCF25'],
    screen: 'VegetablesScreen',
  },
  {
    id: '7',
    name: 'Colors',
    icon: require('../assets/color.png'),
    color: ['#EF3349', '#EF3349'],
    screen: 'Color',
  },
  {
    id: '9',
    name: 'Body Parts',
    icon: require('../assets/human-organs.png'),
    color: ['#2BCB9A', '#2BCB9A'],
    screen: 'BodyPartsScreen',
  },
  {
    id: '10',
    name: 'Shapes',
    icon: require('../assets/shapes.png'),
    color: ['#FFCF25', '#FFCF25'],
    screen: 'ShapesScreen',
  },
  {
    id: '11',
    name: 'Counting',
    icon: require('../assets/numbers.png'),
    color: ['#EF3349', '#EF3349'],
    screen: 'CountingScreen',
  },
  {
    id: '11',
    name: 'Islamic Studies',
    icon: require('../assets/islamic.png'),
    color: ['#2BCB9A', '#2BCB9A'],
    screen: '',
  },
];

const GeneralKnowledge = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color[0] }]}
      onPress={() => {

        if (item.name === 'Animals') {
          navigation.navigate('AnimalsScreen');
        } else if (item.name === 'Fruits') {
          navigation.navigate('FruitScreen');
        } else if (item.name === 'Vegetables') {
          navigation.navigate('VegetableScreen'); // Navigate to VegetablesScreen
        } else if (item.name === 'Colors') {
          navigation.navigate('Color');
        } else if (item.name === 'Vowels') {
          navigation.navigate('VowelScreen');
        } else if (item.name === 'Body Parts') {
          navigation.navigate('BodypartsScreen');
        } else if (item.name === 'Shapes') {
          navigation.navigate('ShapeLearning');
        } else if (item.name === 'Counting') {
          navigation.navigate('CountingScreen');
        }
      }}
    >
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
    color: '#EF3349',
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

export default GeneralKnowledge;
