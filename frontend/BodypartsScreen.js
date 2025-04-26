import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import API_BASE_URL from './config';

const { width } = Dimensions.get('window');

const BodypartsScreen = () => {
  const [bodyparts, setBodyparts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/bodyparts`)
      .then(response => {
        setBodyparts(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching body parts:', error);
        setIsLoading(false);
      });
  }, []);

  const speak = (text) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  if (isLoading) return <ActivityIndicator size="large" color="#2BCB9A" />;

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>Tap on sound icon to learn body parts</Text>
      <ScrollView style={styles.scrollView}>
        {bodyparts.map((part, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: part.image_url }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{part.word}</Text>
              <TouchableOpacity onPress={() => speak(part.sound_text)} style={styles.speakerButton}>
                <Text style={styles.speakerIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default BodypartsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#EF3349',
    marginBottom: 15,
    paddingTop: 30, // 🟢 Added padding to the top
  },
  scrollView: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: width * 0.52, // 🟢 Increased width a bit
    height: 180,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-end', // 🟢 Align to the right
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2BCB9A',
    textAlign: 'right', // 🟢 Right align the text
  },
  speakerButton: {
    marginTop: 10,
    backgroundColor: '#FFCF25',
    padding: 10,
    borderRadius: 50,
  },
  speakerIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
