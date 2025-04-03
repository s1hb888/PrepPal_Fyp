import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../Styles/CommonStyles';

const KidHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topArea}>
          <Text style={styles.title}>Kid Dashboard</Text>
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
  { label: 'Learn Courses', image: require('../assets/learning.png'), screen: 'Courses' },
  { label: 'Learn GK', image: require('../assets/gk.png'), screen: 'GK' },
  { label: 'Assessment', image: require('../assets/test.png'), screen: 'Assesment' },
  { label: 'Videos', image: require('../assets/video.png'), screen: 'PersonsScreen' },
];

export default KidHome;
