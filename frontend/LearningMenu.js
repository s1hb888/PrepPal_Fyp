import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
const kidHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topArea}>
          <Text style={styles.title}>Learning Menu</Text>
        </View>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Image source={item.image} style={styles.image} />
                  <Text style={styles.cardText}>{item.label}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
const menuItems = [
  { label: 'Alphabets', image: require('../assets/alphabets.png'), screen: 'AlphabetsScreen' },
  { label: 'Numbers', image: require('../assets/numbers.png'), screen: 'NumbersScreen' },
  { label: 'Animals', image: require('../assets/animal.png'), screen: 'AnimalsScreen' },
  { label: 'Persons', image: require('../assets/people.png'), screen: 'PersonsScreen' },
  { label: 'Foods', image: require('../assets/food.png'), screen: 'FoodsScreen' },
  { label: 'Phrases', image: require('../assets/phrases.png'), screen: 'PhrasesScreen' },
];
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topArea: {
    height: 200,
    backgroundColor: '#ffc0cb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    width: 150,
    height: 150,
    margin: 10,
    elevation: 7,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default kidHome;
