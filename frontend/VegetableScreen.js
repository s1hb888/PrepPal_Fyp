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

const VegetableScreen = () => {
  const [vegetables, setVegetables] = useState([]);
  const [displayVegetables, setDisplayVegetables] = useState([]);
  const [currentShadowVegetable, setCurrentShadowVegetable] = useState(null);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [incorrectVegetable, setIncorrectVegetable] = useState(null);

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

    axios.get(`${API_BASE_URL}/api/vegetables`).then(res => {
      setVegetables(res.data);
      generateNewSet(res.data);
    });

    return () => {
      if (buzzerSound.current) {
        buzzerSound.current.unloadAsync();
      }
    };
  }, []);

  const generateNewSet = (allVegetables) => {
    if (allVegetables.length < 3) return;
    const shadow = allVegetables[Math.floor(Math.random() * allVegetables.length)];
    const otherVegetables = allVegetables.filter(v => v.word !== shadow.word);
    const shuffled = otherVegetables.sort(() => 0.5 - Math.random()).slice(0, 2);
    const newSet = [...shuffled, shadow].sort(() => 0.5 - Math.random());

    setDisplayVegetables(newSet);
    setCurrentShadowVegetable(shadow);
  };

  const handleSelect = async (vegetable) => {
    if (vegetable.word === currentShadowVegetable.word) {
      setSelectedVegetable(vegetable);
      setIncorrectVegetable(null);
      Speech.speak(vegetable.sound_text);
      animateImageToShadow();

      const updatedList = vegetables.filter(v => v.word !== vegetable.word);
      setTimeout(() => {
        setSelectedVegetable(null);
        setVegetables(updatedList);

        if (updatedList.length >= 3) {
          generateNewSet(updatedList);
        } else {
          Speech.speak("Well done! You matched all the vegetables.");
          setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/vegetables`).then(res => {
              setVegetables(res.data);
              generateNewSet(res.data);
            });
          }, 3000);
        }
      }, 3000);
    } else {
      if (buzzerSound.current) {
        await buzzerSound.current.replayAsync();
      }
      setIncorrectVegetable(vegetable);
      setTimeout(() => {
        setIncorrectVegetable(null);
      }, 800);
      setSelectedVegetable(null);
    }
  };

  const animateImageToShadow = () => {
    setAnimationStarted(true);
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  };

  const getContainerStyle = (vegetable) => {
    if (selectedVegetable && selectedVegetable.word === vegetable.word && vegetable.word === currentShadowVegetable.word) {
      return [styles.vegetableContainer, styles.correctContainer];
    }
    if (incorrectVegetable && incorrectVegetable.word === vegetable.word) {
      return [styles.vegetableContainer, styles.incorrectContainer];
    }
    return styles.vegetableContainer;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Match the Vegetable</Text>

      <View style={styles.shadowContainer}>
        {currentShadowVegetable && (
          <Image source={{ uri: currentShadowVegetable.image_url }} style={styles.shadowImage} />
        )}
        {selectedVegetable && selectedVegetable.word === currentShadowVegetable.word && animationStarted && (
          <Animated.Image
            source={{ uri: selectedVegetable.image_url }}
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
        {displayVegetables.map((veg, index) => {
          const gradient = colorGradients[index % colorGradients.length];
          return (
            <TouchableOpacity key={index} onPress={() => handleSelect(veg)} style={getContainerStyle(veg)}>
              <LinearGradient colors={gradient} style={styles.vegetableCard}>
                <Image source={{ uri: veg.image_url }} style={styles.vegetableImage} />
                <Text style={styles.vegetableName}>{veg.word}</Text>
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
    paddingTop: 20,
    backgroundColor: '#FFFDF8',
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
    marginTop:30,
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
    marginTop: 10,
  },

  vegetableContainer: {
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: 'transparent',
  },

  correctContainer: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },

  incorrectContainer: {
    borderColor: '#F44336',
    backgroundColor: '#F44336',
  },

  vegetableCard: {
    width: 130,
    height: 150,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  vegetableImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  vegetableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});

export default VegetableScreen;