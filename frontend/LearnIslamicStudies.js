import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TEXT = '#000000';
const RED = '#EF3349';
const MINT = '#2BCB9A';

const gradientColors = [
  ['#FFC1CC', '#FFB6C1'],
  ['#A0F0DC', '#7BE7CE'], 
  ['#FFE680', '#FFD54F'], 
];

const categories = [
  {
    name: 'Basic Identity & Beliefs',
    image: require('../assets/beliefs.png'),
    screen: 'BasicBeliefsScreen',
  },
  {
    name: 'Worship & Practice',
    image: require('../assets/worship.png'),
    screen: 'WorshipPracticeScreen',
  },
  {
    name: 'Duas',
    image: require('../assets/dua.png'),
    screen: 'DuaScreen',
  },
];

export default function LearnIslamicStudies({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={require('../assets/islamic banner.png')} style={styles.islamicImage} />
      <Image source={require('../assets/curvy_text.png')} style={styles.curvyTextImage} />
      <Text style={styles.subHeading}>Bright minds, blessed hearts!</Text>

      <View style={styles.categoryContainer}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.cardWrapper}
            onPress={() => navigation.navigate(cat.screen)}
          >
            <LinearGradient
              colors={gradientColors[index % gradientColors.length]}
              style={styles.categoryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image source={cat.image} style={styles.icon} />
              <Text style={styles.cardText}>{cat.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  islamicImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginTop: 30,
  },
  curvyTextImage: {
    width: '100%',
    height: 90,
    resizeMode: 'contain',
    marginTop: 0,
  },
  subHeading: {
    fontSize: 18,
    textAlign: 'center',
    color: TEXT,
    marginBottom: 10,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  cardWrapper: {
    marginBottom: 6,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    minHeight: 100,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    width: 55,
    height: 55,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
  },
});
