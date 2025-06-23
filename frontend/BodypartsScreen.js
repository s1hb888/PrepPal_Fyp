import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_BASE_URL from './config';

const { width } = Dimensions.get('window');

const BodypartsScreen = () => {
  const [bodyparts, setBodyparts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/bodyparts`)
      .then((response) => {
        setBodyparts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
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

  if (isLoading) return <ActivityIndicator size="large" color="#2BCB9A" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      {/* Top Gradient Header */}
      <LinearGradient
        colors={['#FFC1CC', '#FFB6C1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>Learn About Body Parts!</Text>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 30 }}>
        {bodyparts.map((part, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: part.image_url }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{part.word}</Text>
              <TouchableOpacity onPress={() => speak(part.sound_text)}>
                <View style={styles.speakerButton}>
  <Ionicons name="volume-high" size={24} color="#EF3349" />
</View>

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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    padding: 15,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  image: {
    width: width * 0.5,
    height: 160,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#000', // black text for part name
  },
  speakerButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 50,
    backgroundColor: 'rgb(255, 230, 128)', // soft yellow background
  },
  speakerIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

