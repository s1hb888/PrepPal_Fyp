import React, { useEffect, useState, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import API_BASE_URL from './config';

const FruitScreen = () => {
  const [fruits, setFruits] = useState([]);
  const [displayFruits, setDisplayFruits] = useState([]);
  const [currentShadowFruit, setCurrentShadowFruit] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  const buzzerSound = useRef(null); // useRef to persist across re-renders
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    const loadBuzzer = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/buzzer.mp3')  // Make sure this file exists
      );
      buzzerSound.current = sound;
    };
    loadBuzzer();

    axios.get(`${API_BASE_URL}/api/fruits`)
      .then(res => {
        setFruits(res.data);
        generateNewSet(res.data);
      });

    return () => {
      // Unload sound on component unmount
      if (buzzerSound.current) {
        buzzerSound.current.unloadAsync();
      }
    };
  }, []);

  const generateNewSet = (allFruits) => {
    if (allFruits.length < 3) return;

    const shadow = allFruits[Math.floor(Math.random() * allFruits.length)];
    const otherFruits = allFruits.filter(f => f.word !== shadow.word);
    const shuffled = otherFruits.sort(() => 0.5 - Math.random()).slice(0, 2);
    const newSet = [...shuffled, shadow].sort(() => 0.5 - Math.random());

    setCurrentShadowFruit(shadow);
    setDisplayFruits(newSet);
  };

  const handleSelect = async (fruit) => {
    if (fruit.word === currentShadowFruit.word) {
      setSelectedFruit(fruit);
      Speech.speak(`${fruit.sound_text}`);
      animateImageToShadow(fruit);

      const updatedList = fruits.filter(f => f.word !== fruit.word);
      setTimeout(() => {
        setSelectedFruit(null);
        setFruits(updatedList);

        if (updatedList.length >= 3) {
          generateNewSet(updatedList);
        } else {
          Speech.speak("Well done! You matched all the fruits.");
          setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/fruits`)
              .then(res => {
                setFruits(res.data);
                generateNewSet(res.data);
              });
          }, 3000);
        }
      }, 3000);
    } else {
      if (buzzerSound.current) {
        await buzzerSound.current.replayAsync(); // Replay sound even if already loaded
      }
      setSelectedFruit(null);
    }
  };

  const animateImageToShadow = (fruit) => {
    setAnimationStarted(true);

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: 0,
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
            <Text style={styles.fruitName}>{fruit.word}</Text>
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

  fruitContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: 'bold',
    color: '#2BCB9A',
    textAlign: 'center',
    fontFamily: 'Arial',
  },
});

export default FruitScreen;
