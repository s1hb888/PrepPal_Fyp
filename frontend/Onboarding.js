
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: "Welcome to PrepPal",
    description: "Helping kids get ready for school in a fun way!",
    image: "https://img.freepik.com/free-vector/children-reading-books-white-background_1308-99595.jpg",
  },
  {
    id: 2,
    title: "Interactive Learning",
    description: "Engage with exciting quizzes, puzzles, and activities.",
    image: "https://static.vecteezy.com/system/resources/previews/002/391/032/non_2x/online-learning-concept-with-cartoon-character-vector.jpg",
  },
  
  {
    id: 3,
    title: "Track Progress & Rewards",
    description: "Earn stars and track your kid's learning journey.",
    image: "https://static.vecteezy.com/system/resources/previews/040/532/044/non_2x/illustration-of-success-concept-school-achievement-and-success-illustration-first-place-winner-on-white-background-teamwork-consept-vector.jpg",
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

  const goToNext = () => {
    if (screenIndex < onboardingData.length - 1) {
      setScreenIndex(screenIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <GestureRecognizer 
      onSwipeLeft={handleSwipeLeft} 
      onSwipeRight={handleSwipeRight} 
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: onboardingData[screenIndex].image }} 
          style={styles.image} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{onboardingData[screenIndex].title}</Text>
        <Text style={styles.description}>{onboardingData[screenIndex].description}</Text>
      </View>

      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.indicator, 
              index === screenIndex ? styles.activeIndicator : styles.inactiveIndicator
            ]} 
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {screenIndex === onboardingData.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={goToNext}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={goToNext}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d2d',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    color:'#2BCB9A',
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#2BCB9A',
  },
  inactiveIndicator: {
    backgroundColor: '#dddddd',
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    backgroundColor: '#EDB900',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#EDB900',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, 
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold', 
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#dddddd', 
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',  
  },
});

export default Onboarding;
