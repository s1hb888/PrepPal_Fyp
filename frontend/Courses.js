import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../Styles/CommonStyles';

const Courses = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topArea}>
         
          <Text style={styles.title}>Learn Courses</Text>

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
  { label: 'English', image: require('../assets/alphabets.png'), screen: 'LearningMenu' },
  { label: 'Urdu', image: require('../assets/urdu.png'), screen: 'NumbersScreen' },
  { label: 'Numbers', image: require('../assets/numbers.png'), screen: 'AnimalsScreen' }
];

export default Courses;
