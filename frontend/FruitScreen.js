import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import API_BASE_URL from './config';

const FruitScreen = () => {
  const [fruits, setFruits] = useState([]);
  const [displayFruits, setDisplayFruits] = useState([]);
  const [currentShadowFruit, setCurrentShadowFruit] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation values for moving the selected fruit image
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/fruits`)
      .then(res => {
        setFruits(res.data);
        generateNewSet(res.data);
      });
  }, []);

  const generateNewSet = (allFruits) => {
    if (allFruits.length < 3) return; // not enough fruits to continue

    // Pick one random fruit to be the shadow
    const shadow = allFruits[Math.floor(Math.random() * allFruits.length)];

    // Get 2 more random fruits that are NOT the shadow
    const otherFruits = allFruits.filter(f => f.word !== shadow.word);
    const shuffled = otherFruits.sort(() => 0.5 - Math.random()).slice(0, 2);

    // Add shadow fruit to the display set, then shuffle
    const newSet = [...shuffled, shadow].sort(() => 0.5 - Math.random());

    setCurrentShadowFruit(shadow);
    setDisplayFruits(newSet);
  };

  const handleSelect = (fruit) => {
    if (fruit.word === currentShadowFruit.word) {
      setSelectedFruit(fruit);
      Speech.speak(`${fruit.sound_text}`);
  
      // Animate the image to move to the shadow position
      animateImageToShadow(fruit);
  
      const updatedList = fruits.filter(f => f.word !== fruit.word);
      setTimeout(() => {
        setSelectedFruit(null);
        setFruits(updatedList);
  
        if (updatedList.length >= 3) {
          generateNewSet(updatedList);
        } else {
          // End of game or reset logic
          Speech.speak("Well done! You matched all the fruits.");
          setTimeout(() => {
            // Ensure no previous fruits are repeated by setting fresh data
            axios.get(`${API_BASE_URL}/api/fruits`)
              .then(res => {
                setFruits(res.data);
                generateNewSet(res.data);
              });
          }, 3000);
        }
      }, 3000);
    } else {
      setSelectedFruit(null);
    }
  };
  

  const animateImageToShadow = (fruit) => {
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
      <Text style={styles.heading}>Match the Fruit</Text>

      <View style={styles.shadowContainer}>
        {currentShadowFruit && (
          <Image source={{ uri: currentShadowFruit.image_url }} style={styles.shadowImage} />
        )}

        {/* Animated image of the selected fruit */}
        {selectedFruit && selectedFruit.word === currentShadowFruit.word && animationStarted && (
          <Animated.Image
            source={{ uri: selectedFruit.image_url }}
            style={[styles.selectedImage, {
              transform: [
                { translateX: translateX },
                { translateY: translateY }
              ]
            }]}
          />
        )}
      </View>

      <View style={styles.row}>
        {displayFruits.map((fruit, index) => (
          <TouchableOpacity key={index} onPress={() => handleSelect(fruit)} style={styles.fruitContainer}>
            <Image source={{ uri: fruit.image_url }} style={styles.fruitImage} />
            <Text style={styles.fruitName}>{fruit.word}</Text> {/* Displaying the fruit name */}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  heading: {
    fontSize: 25, // Default font size
    fontWeight: '700',
    marginBottom: 20, // Adjusted margin to position the heading lower
    textAlign: 'center',
    color: '#EF3349',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'serif',  // Change font for a more elegant look
  },

  shadowContainer: {
    height: 320, // Adjust this for more space if needed
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
    flexWrap: 'wrap', // Allow wrapping if too many fruits
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  fruitContainer: {
    alignItems: 'center', // Align the image and name vertically
    marginBottom: 20, // Space between the images and the bottom
  },

  fruitImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },

  fruitName: {
    fontSize: 18,
    fontWeight: 'bold', // Make the font bold
    color: '#2BCB9A', // Choose your desired color
    textAlign: 'center',
    fontFamily: 'Arial', // Change font for clarity
  },
  
});

export default FruitScreen;
