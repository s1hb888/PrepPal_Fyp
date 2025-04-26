import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import API_BASE_URL from './config';

const { width } = Dimensions.get('window');

const VowelsScreen = () => {
  const [vowels, setVowels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/vowels`)
      .then(response => {
        setVowels(response.data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const speakVowel = (text, index) => {
    setActiveIndex(index);
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  if (isLoading) return <ActivityIndicator size="large" color="#2BCB9A" />;

  return (
    <View style={styles.container}>
      {/* 🌞 Sun Animation + Heading */}
      <View style={styles.topHeader}>
        <LottieView
          source={require('../assets/animations/animation2.json')}
          autoPlay
          loop
          style={styles.sunAnimation}
        />
        <Text style={styles.headingText}>Tap the Vowel!</Text>
      </View>

      {/* Vowel Buttons with colorful backgrounds */}
      <View style={styles.vowelContainer}>
        {vowels.map((vowel, index) => {
          const colors = ['#EF3349', '#2BCB9A', '#FFCF25'];
          const backgroundColor = colors[index % colors.length];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.box,
                { backgroundColor },
                activeIndex === index && styles.activeBox
              ]}
              onPress={() => speakVowel(vowel.sound_text, index)}
            >
              <Image source={{ uri: vowel.image_url }} style={styles.image} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🌈 Rainbow Animation */}
      <LottieView
        source={require('../assets/animations/animation1.json')}
        autoPlay
        loop
        style={styles.rainbowAnimation}
      />
    </View>
  );
};

export default VowelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  sunAnimation: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  headingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2BCB9A',
  },
  vowelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  box: {
    width: 140,
    height: 140,
    margin: 10,
    padding: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBox: {
    borderColor: '#EF3349',
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  rainbowAnimation: {
    width: width,
    height: 130,
    marginBottom: 10,
  },
});
