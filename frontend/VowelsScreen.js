import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import API_BASE_URL from './config';

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 56) / 2;

const borderGradients = [
  ['#FFC1CC', '#FFB6C1'],
  ['#A0F0DC', '#7BE7CE'],
  ['#FFE680', '#FFD54F'],
];

const VowelsScreen = () => {
  const [vowels, setVowels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vowels`)
      .then((response) => {
        setVowels(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ Vowel fetch error:', err);
        setIsLoading(false);
      });
  }, []);

  const speakVowel = (text, index) => {
    setActiveIndex(index);
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0F0DC" />
        <Text style={styles.loadingText}>Loading vowels...</Text>
      </View>
    );
  }

  const rows = [];
  for (let i = 0; i < vowels.length; i += 2) {
    if (i === vowels.length - 1) {
      rows.push(
        <View key={i} style={styles.singleCenterRow}>
          {renderBox(vowels[i], i)}
        </View>
      );
    } else {
      rows.push(
        <View key={i} style={styles.row}>
          {renderBox(vowels[i], i)}
          {renderBox(vowels[i + 1], i + 1)}
        </View>
      );
    }
  }

  function renderBox(vowel, index) {
    const gradientColors = borderGradients[index % borderGradients.length];
    const isActive = activeIndex === index;

    return (
      <TouchableOpacity
        key={vowel.id}
        onPress={() => speakVowel(vowel.sound_text, index)}
        activeOpacity={0.9}
        style={styles.cardContainer}
      >
        <LinearGradient 
          colors={gradientColors} 
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageContainer}>
            <Animatable.Image
              animation={isActive ? 'pulse' : undefined}
              iterationCount="infinite"
              easing="ease-in-out"
              duration={1000}
              source={{ uri: vowel.image_url }}
              style={styles.image}
            />
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.soundButton}>
              <Ionicons 
                name={isActive ? "volume-high" : "volume-medium-outline"} 
                size={18} 
                color="#000" 
              />
            </View>
          </View>

          {isActive && (
            <Animatable.View 
              animation="fadeIn" 
              style={styles.activeIndicator}
            >
              <View style={styles.activeRing} />
            </Animatable.View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vowels</Text>
          <Text style={styles.subtitle}>Tap cards to learn vowel</Text>
        </View>

        {/* Vowel Cards */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {rows}
        </ScrollView>
      </View>
    </>
  );
};

export default VowelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 0,
    marginTop:-30,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  singleCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    width: cardSize,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    margin: 3,
    borderRadius: 17,
    padding: 12,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  cardFooter: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    marginBottom: 3,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRing: {
    width: '95%',
    height: '95%',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});