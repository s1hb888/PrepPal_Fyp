import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config';

const { width } = Dimensions.get('window');
const circleSize = width * 0.42;

const borderGradients = [
  ['#FFC1CC', '#FFB6C1'], // pink
  ['#A0F0DC', '#7BE7CE'], // mint
  ['#FFE680', '#FFD54F'], // yellow
];

const VowelsScreen = () => {
  const [vowels, setVowels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vowels`)
      .then((response) => {
        setVowels(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ Vowel fetch error:', err);
        setIsLoading(false);
      });
  }, []);

  const speakVowel = (text, index) => {
    setActiveIndex(index);
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF3349" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Let's Learn Vowels!</Text>
      </View>

      <View style={styles.vowelContainer}>
        {vowels.map((vowel, index) => {
          const gradientColors = borderGradients[index % borderGradients.length];
          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={vowel.id}
              onPress={() => speakVowel(vowel.sound_text, index)}
              activeOpacity={0.85}
              style={styles.circleWrapper}
            >
              <LinearGradient
                colors={gradientColors}
                style={[
                  styles.circle,
                  isActive && { transform: [{ scale: 1.08 }] },
                ]}
              >
                <Image source={{ uri: vowel.image_url }} style={styles.image} />
                <View style={styles.soundWrapper}>
                  <Ionicons name="volume-high" size={26} color="#EF3349" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default VowelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  vowelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingTop: 40,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  circleWrapper: {
    width: '49%',
    alignItems: 'center',
    marginBottom: 36,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  image: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  soundWrapper: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginTop: -10,
  },
});
