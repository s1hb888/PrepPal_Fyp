import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
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
    screen: 'BasicQuestionsScreen',
  },
  {
    name: 'Duas',
    image: require('../assets/dua.png'),
    screen: 'DuaScreen',
  },
];

export default function LearnIslamicStudies({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  islamicImage: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
    marginTop: 40,
  },
  curvyTextImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    marginTop: 20,
  },
  subHeading: {
    fontSize: 18,
    textAlign: 'center',
    color: TEXT,
    marginBottom: 30,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: 15,
    alignItems: 'center',
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    width: width * 0.85,
    minHeight: 150, 
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    width: 90, 
    height: 90,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
});
