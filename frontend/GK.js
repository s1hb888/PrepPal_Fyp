import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../Styles/CommonStyles';

const GK = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topArea}>
          <Text style={styles.title}>Learn General Knowledge</Text>
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
  { label: 'Colors', image: require('../assets/color.png'), screen: 'Color' },
  { label: 'Shapes', image: require('../assets/shapes.png'), screen: 'NumbersScreen' },
  { label: 'Counting', image: require('../assets/counting.png'), screen: 'AnimalsScreen' },
  { label: 'Self introduction', image: require('../assets/introduction.png'), screen: 'LearningMenu' },
  { label: 'Body parts', image: require('../assets/body.png'), screen: 'NumbersScreen' },
  { label: 'Fruits', image: require('../assets/fruits.png'), screen: 'AnimalsScreen' },
  { label: 'Vegetables', image: require('../assets/vegetable.png'), screen: 'LearningMenu' },
  { label: 'Islamic studies', image: require('../assets/islamic.png'), screen: 'LearningMenu' }
];

export default GK;
