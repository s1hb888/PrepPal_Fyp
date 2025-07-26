import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from './config';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const themeCards = [
  ['#2BCB9A', '#CFFFE8'], // mint
  ['#FFC1CC', '#FFF0F3'], // pink
  ['#FFCF25', '#FFF9D6'], // yellow
  ['#FFE4E1', '#FFF5F7'], // light red
];

const WorshipPracticeScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [showInfo, setShowInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/worship`);
      setQuestions(res.data);
    } catch (error) {
      console.error('Error fetching worship questions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const speak = (text) => {
    Speech.speak(text, { language: 'en', pitch: 1.3 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worship & Practice</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2BCB9A" />
      ) : (
        <ScrollView style={styles.scroll}>
          {questions.map((item, index) => {
            const cardColors = themeCards[index % themeCards.length];
            return (
              <LinearGradient
                key={index}
                colors={cardColors}
                style={styles.card}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowInfo(showInfo === index ? null : index);
                    speak(item.question);
                  }}
                  style={styles.questionRow}
                >
                  <FontAwesome5
                    name="mosque"
                    size={22}
                    color="#EF3349"
                    style={styles.icon}
                  />
                  <Text style={styles.questionText}>{item.question}</Text>
                </TouchableOpacity>

                {showInfo === index && (
                  <View
                    style={[
                      styles.answerWrapper,
                      { backgroundColor: `${cardColors[1]}CC` }, // 80% opacity
                    ]}
                  >
                    <Text style={styles.answerText}>{item.answer}</Text>
                    <TouchableOpacity
                      onPress={() => speak(item.answer)}
                      style={[styles.speakBtn, { backgroundColor: '#EF3349' }]}
                    >
                      <FontAwesome5 name="volume-up" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            );
          })}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => setShowInfo(null)}
        style={styles.hideAllBtn}
      >
        <Text style={styles.hideAllText}>Hide All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EF3349',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
  scroll: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  answerWrapper: {
    marginTop: 10,
    paddingLeft: 34,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerText: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    lineHeight: 20,
  },
  speakBtn: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  hideAllBtn: {
    backgroundColor: '#2BCB9A',
    marginHorizontal: 40,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  hideAllText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WorshipPracticeScreen;
