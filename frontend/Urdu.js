import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import API_BASE_URL from './config'; // 🔁 Make sure this file exports the correct API base URL
import styles from '../Styles/learningStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Urdu = () => {
  const [alphabetData, setAlphabetData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchAlphabetData();
  }, []);

  const fetchAlphabetData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found in storage');
        return;
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/access/urdu`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('Fetched:', response.data);
      setAlphabetData(response.data);
    } catch (error) {
      console.error('Error loading urdu:', error);
      Alert.alert('Error', 'Failed to load urdu. Please try again.');
    }
  };

  const handleVoicePress = (soundText) => {
    if (soundText) {
      Speech.speak(soundText,{
        language: 'ur-PK',
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < alphabetData.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  useEffect(() => {
    if (alphabetData.length > 0 && alphabetData[currentIndex]?.sound_text) {
      Speech.stop(); // optional: stop any previous speech
      Speech.speak(alphabetData[currentIndex].sound_text,{
        language: 'ur-PK',
      });
    }
  }, [currentIndex, alphabetData]);
  
   const onViewRef = useRef(({ viewableItems }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }) => (
    <View style={styles.page}>
      <Text style={styles.letter}>{item.alphabet}</Text>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.word}>{item.word}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={alphabetData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        onViewableItemsChanged={onViewRef.current} 
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Controls: Previous | Speaker | Next */}
      <View style={styles.controlsRow}>
      <TouchableOpacity onPress={handlePrevious} style={styles.modernButton}>
  <Text style={styles.buttonText}>Prev</Text>
</TouchableOpacity>


<TouchableOpacity
  onPress={() => handleVoicePress(alphabetData[currentIndex]?.sound_text)}
  style={styles.modernButton}
>
  <Text style={styles.buttonText}>🔊</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleNext} style={styles.modernButton}>
  <Text style={styles.buttonText}>Next</Text>
</TouchableOpacity>
      </View>
    </View>
  );
};

export default Urdu;
