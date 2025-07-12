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
import * as Animatable from 'react-native-animatable';
import API_BASE_URL from './config';

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 48) / 2;

const borderGradients = [
  ['#FFC1CC', '#FFB6C1'],
  ['#A0F0DC', '#7BE7CE'],
  ['#FFE680', '#FFD54F'],
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

  const rows = [];
  for (let i = 0; i < vowels.length; i += 2) {
    if (i === vowels.length - 1) {
      rows.push(
        <View key={i} style={styles.singleCenterRow}>
          {renderBox(vowels[i], i)}
        </View>
      );
    } else {
      rows.push(
        <View key={i} style={styles.row}>
          {renderBox(vowels[i], i)}
          {renderBox(vowels[i + 1], i + 1)}
        </View>
      );
    }
  }

  function renderBox(vowel, index) {
    const gradientColors = borderGradients[index % borderGradients.length];
    const isActive = activeIndex === index;

    return (
      <TouchableOpacity
        key={vowel.id}
        onPress={() => speakVowel(vowel.sound_text, index)}
        activeOpacity={0.85}
        style={styles.box}
      >
        <LinearGradient colors={gradientColors} style={styles.rectangle}>
          <Animatable.Image
            animation={isActive ? 'pulse' : undefined}
            iterationCount="infinite"
            easing="ease-in-out"
            source={{ uri: vowel.image_url }}
            style={styles.image}
          />
          <TouchableOpacity style={styles.soundWrapper}>
            <Ionicons name="volume-high" size={20} color="#EF3349" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
  colors={['#FFEB99', '#FFD1DC']}
  start={{ x: 0.1, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.fancyHeader}
>
  <Animatable.Text
    animation="bounceIn"
    duration={1500}
    style={styles.fancyTitle}
  >
    🎈 Let's Learn Vowels! 🌈
  </Animatable.Text>
</LinearGradient>


      <View style={styles.vowelContainer}>{rows}</View>
    </View>
  );
};

export default VowelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  fancyHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 40,
    elevation: 5,
    shadowColor: '#FFCF25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fancyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#EF3349',
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'serif',
  },
  vowelContainer: {
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  singleCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  box: {
    width: cardSize,
  },
  rectangle: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    position: 'relative',
  },
  image: {
    width: '92%',
    height: 140,
    resizeMode: 'contain',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  soundWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
