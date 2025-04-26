import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import API_BASE_URL from './config';

const VegetableScreen = () => {
  const [vegetables, setVegetables] = useState([]);
  const [displayVegetables, setDisplayVegetables] = useState([]);
  const [currentShadowVegetable, setCurrentShadowVegetable] = useState(null);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation values for moving the selected vegetable image
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/vegetables`)
      .then(res => {
        setVegetables(res.data);
        generateNewSet(res.data);
      });
  }, []);

  const generateNewSet = (allVegetables) => {
    if (allVegetables.length < 3) return; // not enough vegetables to continue

    // Pick one random vegetable to be the shadow
    const shadow = allVegetables[Math.floor(Math.random() * allVegetables.length)];

    // Get 2 more random vegetables that are NOT the shadow
    const otherVegetables = allVegetables.filter(v => v.word !== shadow.word);
    const shuffled = otherVegetables.sort(() => 0.5 - Math.random()).slice(0, 2);

    // Add shadow vegetable to the display set, then shuffle
    const newSet = [...shuffled, shadow].sort(() => 0.5 - Math.random());
    setDisplayVegetables(newSet);
    setCurrentShadowVegetable(shadow);
  };

  const handleSelect = (vegetable) => {
    if (vegetable.word === currentShadowVegetable.word) {
      setSelectedVegetable(vegetable);
      Speech.speak(vegetable.sound_text);
  
      // Animate the image to move to the shadow position
      animateImageToShadow(vegetable);
  
      const updatedList = vegetables.filter(v => v.word !== vegetable.word);
      setTimeout(() => {
        setSelectedVegetable(null);
        setVegetables(updatedList);
  
        if (updatedList.length >= 3) {
          generateNewSet(updatedList);
        } else {
          // End of game or reset logic
          Speech.speak("Well done! You matched all the vegetables.");
          setTimeout(() => {
            // Ensure no previous vegetables are repeated by setting fresh data
            axios.get(`${API_BASE_URL}/api/vegetables`)
              .then(res => {
                setVegetables(res.data);
                generateNewSet(res.data);
              });
          }, 3000);
        }
      }, 3000);
    } else {
      setSelectedVegetable(null);
    }
  };

  const animateImageToShadow = (vegetable) => {
    setAnimationStarted(true);

    // Assuming the shadow image's position is (x: 0, y: 0) for simplicity.
    // Adjust the target position if needed based on your layout
    const targetX = 0; // You can adjust this based on your shadow's position
    const targetY = 0; // Same for the Y position

    Animated.spring(translateX, {
      toValue: targetX,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Match the Vegetable</Text>

      <View style={styles.shadowContainer}>
        {currentShadowVegetable && (
          <Image source={{ uri: currentShadowVegetable.image_url }} style={styles.shadowImage} />
        )}

        {/* Animated image of the selected vegetable */}
        {selectedVegetable && selectedVegetable.word === currentShadowVegetable.word && animationStarted && (
          <Animated.Image
            source={{ uri: selectedVegetable.image_url }}
            style={[styles.selectedImage, {
              transform: [
                { translateX: translateX },
                { translateY: translateY }
              ]
            }]}/>
        )}
      </View>

      <View style={styles.row}>
        {displayVegetables.map((vegetable, index) => (
          <TouchableOpacity key={index} onPress={() => handleSelect(vegetable)} style={styles.vegetableContainer}>
            <Image source={{ uri: vegetable.image_url }} style={styles.vegetableImage} />
            <Text style={styles.vegetableName}>{vegetable.word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  heading: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#EF3349',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'serif',
  },

  shadowContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },

  shadowImage: {
    width: 220,
    height: 220,
    opacity: 0.3,
    position: 'absolute',
    resizeMode: 'contain',
  },

  selectedImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    position: 'absolute',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  vegetableContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  vegetableImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },

  vegetableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2BCB9A',
    textAlign: 'center',
    fontFamily: 'Arial',
  },
});

export default VegetableScreen;
