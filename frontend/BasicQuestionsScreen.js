import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import * as ScreenOrientation from 'expo-screen-orientation';
import Svg, { Circle } from 'react-native-svg';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import API_BASE_URL from './config';

const { width, height } = Dimensions.get('window');

// 🌸 Flower Decoration
const FlowerDecoration = ({ x, y, color, size = 1 }) => (
  <View style={[styles.flower, { left: x, top: y, transform: [{ scale: size }] }]}>
    <Svg width="20" height="20" viewBox="0 0 20 20">
      <Circle cx="10" cy="10" r="3" fill={color} />
      <Circle cx="10" cy="5" r="2" fill={color} opacity="0.8" />
      <Circle cx="15" cy="10" r="2" fill={color} opacity="0.8" />
      <Circle cx="10" cy="15" r="2" fill={color} opacity="0.8" />
      <Circle cx="5" cy="10" r="2" fill={color} opacity="0.8" />
      <Circle cx="10" cy="10" r="1" fill="#FFE680" />
    </Svg>
  </View>
);

// ☁️ Cloud
const Cloud = ({ x, y, size = 1 }) => (
  <View style={[styles.cloud, { left: x, top: y, transform: [{ scale: size }] }]}>
    <Svg height="50" width="100">
      <Circle cx="25" cy="30" r="20" fill="white" />
      <Circle cx="55" cy="20" r="25" fill="white" />
      <Circle cx="80" cy="30" r="20" fill="white" />
      <Circle cx="40" cy="40" r="15" fill="white" />
    </Svg>
  </View>
);

export default function BasicQuestionsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQA, setCurrentQA] = useState({ question: '', answer: '' });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const cardScale = useRef(new Animated.Value(0)).current;
  const boardOpacity = useRef(new Animated.Value(0)).current;
  const questionOpacity = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;
  const sunRotation = useRef(new Animated.Value(0)).current;
  const startButtonScale = useRef(new Animated.Value(0)).current;

  // 🔒 Lock to landscape on mount, unlock on unmount
  useEffect(() => {
    const lock = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    };
    lock();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/basic-questions`);
      setData(res.data);
      if (res.data.length > 0) setCurrentQA(res.data[0]);
    } catch (err) {
      console.error('API failed:', err.message);
    } finally {
      setLoading(false);
      Animated.timing(boardOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.timing(cardScale, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => {
        Animated.spring(startButtonScale, { toValue: 1, useNativeDriver: true }).start(() => {
          // Speak the welcome message when board appears
          Speech.speak("Let's learn some basic concepts about Islam!", {
            language: "en",
            pitch: 0.9,
            rate: 0.9,
          });
        });
      });
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 🌞 Sun rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(sunRotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (started && data.length > 0) {
      const qa = data[currentIndex];
      setCurrentQA(qa);
      setShowAnswer(false);
      cardScale.setValue(0);
      questionOpacity.setValue(0);
      answerOpacity.setValue(0);

      Animated.timing(cardScale, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
        Animated.timing(questionOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
          speak(qa.question, "question", qa);
        });
      });
    }
  }, [currentIndex, data, started]);

  const speak = (text, type, qaRef) => {
    if (!text) return;
    setIsSpeaking(true);
    Speech.stop();
    Speech.speak(text, {
      language: 'en',
      pitch: 0.9,
      rate: 0.85,
      onDone: () => {
        if (type === 'question') {
          setShowAnswer(true);
          Animated.timing(answerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
            speak(qaRef.answer, 'answer', qaRef);
          });
        } else {
          setIsSpeaking(false);
        }
      },
      onStopped: () => setIsSpeaking(false),
    });
  };

  const handleStart = () => {
    setStarted(true);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      Speech.stop();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < data.length - 1) {
      Speech.stop();
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ExpoLinearGradient colors={['#87CEEB', '#98D8E8', '#7BE7CE']} style={styles.gradientBackground} />
        <ActivityIndicator size="large" color="#2BCB9A" />
        <Text style={styles.loadingText}>Loading Basic Questions...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />
        <ExpoLinearGradient colors={['#87CEEB', '#98D8E8', '#E0F6FF']} style={styles.gradientBackground} />
        <View style={styles.ground} />

        {/* 🌞 Sun */}
        <Animated.View
          style={[
            styles.sun,
            {
              transform: [
                {
                  rotate: sunRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg height="100" width="100">
            <Circle cx="50" cy="50" r="30" fill="#FFD700" />
          </Svg>
        </Animated.View>

        {/* 👩 Teacher */}
        <View style={styles.teacherPosition}>
          <Image
            source={{ uri: 'https://img2.clipart-library.com/27/muslim-teacher-clipart/muslim-teacher-clipart-18.png' }}
            style={styles.teacherImage}
            resizeMode="contain"
          />
        </View>

        {/* ☁️ Clouds */}
        <Cloud x={width * 0.03} y={height * 0.02} size={1} />
        <Cloud x={width * 0.18} y={height * 0.045} size={0.9} />

        {/* 📋 Card */}
        {!started ? (
          // Initial Welcome Board
          <Animated.View style={[styles.questionCard, { opacity: boardOpacity, transform: [{ scale: cardScale }] }]}>
            <ExpoLinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.cardGradient}>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>Let's learn basic{'\n'}concepts about Islam!</Text>
                <Animated.View style={{ transform: [{ scale: startButtonScale }] }}>
                  <TouchableOpacity onPress={handleStart}>
                    <ExpoLinearGradient
                      colors={['#FFE680', '#FFD54F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.startButton}
                    >
                      <FontAwesome5 name="play" size={20} color="#EF3349" style={{ marginRight: 8 }} />
                      <Text style={styles.startButtonText}>START</Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </ExpoLinearGradient>
          </Animated.View>
        ) : (
          // Questions Board
          <Animated.View style={[styles.questionCard, { opacity: boardOpacity, transform: [{ scale: cardScale }] }]}>
            <ExpoLinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.cardGradient}>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{currentIndex + 1} / {data.length}</Text>
              </View>
              <TouchableOpacity
                style={[styles.navButton, styles.leftNav, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
                onPress={goPrev}
                disabled={currentIndex === 0}
              >
                <FontAwesome5 name="chevron-left" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, styles.rightNav, { opacity: currentIndex === data.length - 1 ? 0.3 : 1 }]}
                onPress={goNext}
                disabled={currentIndex === data.length - 1}
              >
                <FontAwesome5 name="chevron-right" size={20} color="white" />
              </TouchableOpacity>
              <View style={styles.cardContent}>
                <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
                  <Text style={styles.questionText}>{currentQA.question}</Text>
                </Animated.View>
                {showAnswer && (
                  <Animated.View style={[styles.answerContainer, { opacity: answerOpacity }]}>
                    <Text style={styles.answerText}>{currentQA.answer}</Text>
                  </Animated.View>
                )}
              </View>
            </ExpoLinearGradient>
          </Animated.View>
        )}

        {/* 🌸 Flowers */}
        <FlowerDecoration x={50} y={height - 50} color="#FFC1CC" size={1.2} />
        <FlowerDecoration x={width - 100} y={height - 40} color="#FFE680" size={1.1} />
        <FlowerDecoration x={width / 2} y={height - 30} color="#A0F0DC" size={1.3} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#87CEEB' },
  loadingText: { marginTop: 20, fontSize: 18, color: '#2BCB9A', fontWeight: 'bold' },
  gradientBackground: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#2BCB9A' },
  sun: { position: 'absolute', top: 1, right: 7, zIndex: 1 },
  teacherPosition: {
    position: 'absolute',
    left: 10,
    bottom: -40,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  teacherImage: {
    width: 240,
    height: undefined,
    aspectRatio: 0.7,
    resizeMode: 'contain',
  },
  cloud: {
    position: 'absolute',
    zIndex: 1,
    resizeMode: 'contain',
    width: 140,
    height: 80,
  },
  questionCard: {
    position: 'absolute',
    left: '28%',
    top: '15%',
    width: '60%',
    height: '70%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 25,
    zIndex: 0,
  },
  cardGradient: { flex: 1, borderRadius: 30, padding: 20 },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF3349',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 30,
  },
  startButton: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  progressContainer: {
    position: 'absolute',
    top: 15,
    left: 20,
    backgroundColor: '#FFE680',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  navButton: {
    position: 'absolute',
    top: '58%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF3349',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  leftNav: { left: -25 },
  rightNav: { right: -25 },
  cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  questionContainer: { marginBottom: 10, paddingHorizontal: 10 },
  questionText: { fontSize: 24, fontWeight: 'bold', color: '#EF3349', textAlign: 'center', lineHeight: 32 },
  answerContainer: {
    backgroundColor: '#F1F8E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2BCB9A',
    maxWidth: '90%',
  },
  answerText: { fontSize: 18, color: '#2E7D32', textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  flower: { position: 'absolute' },
});