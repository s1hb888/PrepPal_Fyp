import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

const onboardingData = [
  {
    id: 1,
    title: "Welcome to PrepPal",
    description: "Helping kids get ready for school in a fun way!",
    image: "https://cdn.pixabay.com/photo/2016/11/21/15/52/children-1846744_960_720.jpg",
  },
  {
    id: 2,
    title: "Interactive Learning",
    description: "Engage with exciting quizzes, puzzles, and activities.",
    image: "https://cdn.pixabay.com/photo/2018/04/12/12/56/kids-3314363_960_720.jpg",
  },
  {
    id: 3,
    title: "Track Progress & Rewards",
    description: "Earn stars and track your kid's learning journey.",
    image: "https://cdn.pixabay.com/photo/2016/06/24/10/47/children-1473851_960_720.jpg",
  },
];

const Onboarding = ({ navigation }) => {
  const [screenIndex, setScreenIndex] = useState(0);

  const handleSwipeLeft = () => {
    if (screenIndex < onboardingData.length - 1) {
      setScreenIndex(screenIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (screenIndex > 0) {
      setScreenIndex(screenIndex - 1);
    }
  };

  return (
    <GestureRecognizer 
      onSwipeLeft={handleSwipeLeft} 
      onSwipeRight={handleSwipeRight} 
      style={styles.container}
    >
      <Image source={{ uri: onboardingData[screenIndex].image }} style={styles.image} />

      <Text style={styles.title}>{onboardingData[screenIndex].title}</Text>
      <Text style={styles.description}>{onboardingData[screenIndex].description}</Text>

      {screenIndex === onboardingData.length - 1 ? (
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Home')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.skipButton} onPress={() => setScreenIndex(onboardingData.length - 1)}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c70ec',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#fe7100',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Onboarding;
