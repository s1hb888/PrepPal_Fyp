import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../Styles/CommonStyles';

const parentHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topArea}>
          <Text style={styles.title}>Kids Dashboard</Text>
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
  { label: 'Course', image: require('../assets/course.png'), screen: 'CourseList' },
  { label: 'Kid Progress', image: require('../assets/progress.png'), screen: 'QuizzProgress' },
  { label: 'Profile', image: require('../assets/profile.png'), screen: 'profile' },
  { label: 'Settings', image: require('../assets/settings.png'), screen: 'settings' },
];

export default parentHome;
