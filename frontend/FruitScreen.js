import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config';

const { width, height } = Dimensions.get('window');

const colorGradients = [
  ['#FFE680', '#FFD54F'], // yellow
  ['#FFC1CC', '#FFB6C1'], // pink
  ['#A0F0DC', '#7BE7CE'], // mint
];

const FruitScreen = () => {
  const [fruits, setFruits] = useState([]);
  const [displayFruits, setDisplayFruits] = useState([]);
  const [currentShadowFruit, setCurrentShadowFruit] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  const buzzerSound = useRef(null);
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    const loadBuzzer = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/buzzer.mp3')
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
        await buzzerSound.current.replayAsync();
      }
      setSelectedFruit(null);
    }
  };

  const animateImageToShadow = () => {
    setAnimationStarted(true);
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
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
        {displayFruits.map((fruit, index) => {
          const gradientColors = colorGradients[index % colorGradients.length];
          return (
            <TouchableOpacity key={index} onPress={() => handleSelect(fruit)} style={styles.fruitContainer}>
              <LinearGradient colors={gradientColors} style={styles.fruitCard}>
                <Image source={{ uri: fruit.image_url }} style={styles.fruitImage} />
                <Text style={styles.fruitName}>{fruit.word}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#FFFDF8',
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
    marginTop:40,
    textAlign: 'center',
  },

  shadowContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },

  shadowImage: {
    width: 180,
    height: 180,
    opacity: 0.2,
    resizeMode: 'contain',
    position: 'absolute',
  },

  selectedImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    position: 'absolute',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    zIndex: 1,
    marginTop: 10,
  },

  fruitContainer: {
    marginBottom: 20,
  },

  fruitCard: {
    width: 130,
    height: 150,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  fruitImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  fruitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});

export default FruitScreen;

