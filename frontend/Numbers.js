import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import API_BASE_URL from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Numbers = () => {
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

      const response = await axios.get(`${API_BASE_URL}/api/access/numbers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched:', response.data);
       const activeItems = response.data.filter(item => item.active === true);
      setAlphabetData(activeItems);
    } catch (error) {
      console.error('Error loading numbers:', error);
      Alert.alert('Error', 'Failed to load numbers. Please try again.');
    }
  };

  const handleVoicePress = (soundText) => {
    if (soundText) {
      Speech.speak(soundText, {
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
      Speech.stop();
      Speech.speak(alphabetData[currentIndex].sound_text, {
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
      <Text style={styles.letter}>{item.number}</Text>

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

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handlePrevious} style={styles.button}>
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleVoicePress(alphabetData[currentIndex]?.sound_text)}
          style={styles.button}
        >
          <Ionicons name="volume-high" size={24} color="#EF3349" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  letter: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  word: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
  },
  imageContainer: {
    borderWidth: 3,
    borderColor: '#FFD54F',
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#fff',
    elevation: 3,
  },
  image: {
    width: 300,
    height: 320,
    borderRadius: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#A0F0DC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Numbers;

