import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const subjects = [
  {
    id: '1',
    name: 'Vowels',
    icon: require('../assets/vowel.png'),
    color: ['#FFC1CC', '#FFB6C1'],
    screen: 'VowelScreen',
  },
  {
    id: '2',
    name: 'Fruits',
    icon: require('../assets/fruits.png'),
    color: ['#A0F0DC', '#7BE7CE'],
    screen: 'FruitScreen',
  },
  {
    id: '3',
    name: 'Vegetables',
    icon: require('../assets/vegetable.png'),
    color: ['#FFE680', '#FFD54F'],
    screen: 'VegetableScreen',
  },
  {
    id: '4',
    name: 'Colors',
    icon: require('../assets/color.png'),
    color: ['#FFC1CC', '#FFB6C1'],
    screen: 'Color',
  },
  {
    id: '5',
    name: 'Body Parts',
    icon: require('../assets/human-organs.png'),
    color: ['#A0F0DC', '#7BE7CE'],
    screen: 'BodypartsScreen',
  },
  {
    id: '6',
    name: 'Shapes',
    icon: require('../assets/shapes.png'),
    color: ['#FFE680', '#FFD54F'],
    screen: 'ShapeLearning',
  },
  {
    id: '7',
    name: 'Counting',
    icon: require('../assets/numbers.png'),
    color: ['#FFC1CC', '#FFB6C1'],
    screen: 'CountingScreen',
  },
  {
    id: '8',
    name: 'Islamic Studies',
    icon: require('../assets/islamic.png'),
    color: ['#A0F0DC', '#7BE7CE'],
    screen: 'LearnIslamicStudies',
  },
];

const GeneralKnowledge = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => {
        if (item.screen) {
          navigation.navigate(item.screen);
        }
      }}
    >
      <LinearGradient
        colors={item.color}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.row}>
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
          <Text style={styles.cardText}>{item.name}</Text>
        </View>
      </LinearGradient>
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
    color: 'rgb(0,0,0)',
  },
  kids: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgb(255,182,193)',
    marginBottom: 24,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#000',
  },
  icon: {
    width: 60,
    height: 60,
  },
});

export default GeneralKnowledge;
