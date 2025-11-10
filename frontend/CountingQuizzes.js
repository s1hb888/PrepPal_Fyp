// screens/CountingQuizzes.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "./config";
import { LinearGradient } from 'expo-linear-gradient';

const LEMONFOX_API_KEY = "nTmqKSP4x1kaFTCdEyAsYv3tQ6Vk4Stm";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const CountingQuizzes = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  // Highlight state removed as counting quiz answers are typically numbers, not words to highlight.
  // const [highlightedWord, setHighlightedWord] = useState(null); 

  const [finalScore, setFinalScore] = useState(null);
  const [earnedStars, setEarnedStars] = useState(0);
  const [rewardMessage, setRewardMessage] = useState("");

  const correctSound = useRef(new Audio.Sound());
  const wrongSound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await correctSound.current.loadAsync(
          require("../assets/sounds/answer-correct.mp3")
        );
        await wrongSound.current.loadAsync(
          require("../assets/sounds/buzzer-new.mp3")
        );
      } catch (err) {
        console.error("Failed to load sounds:", err);
      }
    };
    loadSounds();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quizCounting/`);
        const normalized = response.data.map((quiz) => ({
          ...quiz,
          questions: quiz.questions.map((q) => ({
            ...q,
            images: Array.isArray(q.images)
              ? q.images.map((img) => ({
                  url: img.url || img.image_url || img,
                }))
              : [],
          })),
        }));
        setQuizzes(normalized);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizzes.length === 0 || finalScore !== null) return;
    const currentQuestion =
      quizzes[currentQuizIndex]?.questions[currentQuestionIndex];
    if (currentQuestion?.question) {
      Speech.speak(currentQuestion.question, { language: "en" });
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes, finalScore]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Microphone permission not granted!");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      if (uri) await sendToLemonFox(uri);
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    } catch (err) {
      console.error("Stop recording error:", err);
    }
  };

  const sendToLemonFox = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", { uri, name: "speech.m4a", type: "audio/m4a" });
      formData.append("language", "english");
      formData.append("response_format", "json");

      const res = await fetch(
        "https://api.lemonfox.ai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${LEMONFOX_API_KEY}` },
          body: formData,
        }
      );
      const data = await res.json();
      const spoken = normalizeRaw(data.text || "");
      console.log(spoken);
      const currentQuestion =
        quizzes[currentQuizIndex]?.questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(currentQuestion.answer);
      
      let isCorrect = spoken.includes(correctAnswer);

      if (isCorrect) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
      } else {
        await wrongSound.current.replayAsync();
      }
      
      setTimeout(() => handleNext(), isCorrect ? 1500 : 2000); // Shorter delay on correct answer
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Alert.alert("Error", "Could not understand your answer.");
      setTimeout(() => handleNext(), 1500); // Move to next question even if there's an error
    }
  };

  const handleNext = () => {
    const currentQuiz = quizzes[currentQuizIndex];
    const isLastQuestion =
      currentQuestionIndex === currentQuiz.questions.length - 1;

    if (isLastQuestion) {
      const isLastQuiz = currentQuizIndex === quizzes.length - 1;
      if (isLastQuiz) {
        const totalQuestions = quizzes[currentQuizIndex].questions.length;
        const scorePercent = (score / totalQuestions) * 100;
        let stars = 0;
        let message = "";

        if (scorePercent >= 90) {
          stars = 3;
          message = "Excellent! You earned 3 Gold Stars";
        } else if (scorePercent >= 80) {
          stars = 2;
          message = "Great! You earned 2 Gold Stars";
        } else if (scorePercent >= 70) {
          stars = 1;
          message = "Good! You earned 1 Gold Star";
        } else if (scorePercent >= 60) {
          message = "Well done! You’re one step away from earning a star.";
        } else if (scorePercent > 50) {
          message = "Good effort! Keep trying.";
        } else if (scorePercent === 50) {
          message = "You passed!";
        } else {
          message = "Don’t worry, you’ll do better next time!";
        }

        setFinalScore(scorePercent);
        setEarnedStars(stars);
        setRewardMessage(message);

        // ✅ Speak the message aloud
        Speech.speak(message);
      } else {
        // Move to the next quiz
        setCurrentQuizIndex((p) => p + 1);
        setCurrentQuestionIndex(0);
      }

    } else {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handleOkPress = () => {
    Speech.stop();
    navigation.goBack();
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );

  if (!quizzes.length)
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No quizzes found.</Text>
      </View>
    );

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const images = currentQuestion?.images || [];
  const totalQuestions = currentQuiz.questions.length;


  return (
    <SafeAreaView style={styles.safeArea}>
      {finalScore !== null ? (
        <LinearGradient 
          colors={['#E8F5E9', '#FFFFFF']} 
          style={styles.resultContainer}
        >
          <View style={styles.resultCard}>
            <View style={styles.trophyContainer}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
            
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{finalScore.toFixed(0)}%</Text>
              <Text style={styles.scoreLabelText}>Score</Text>
            </View>

            <View style={styles.starsRow}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={styles.starWrapper}>
                  <Ionicons
                    name={i < earnedStars ? "star" : "star-outline"}
                    size={48}
                    color={i < earnedStars ? "#FFD700" : "#E0E0E0"}
                  />
                </View>
              ))}
            </View>

            <View style={styles.messageBox}>
              <Text style={styles.rewardMessage}>{rewardMessage}</Text>
            </View>

            <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
              <LinearGradient
                colors={['#7BE7CE', '#5DD4B4']}
                style={styles.okButtonGradient}
              >
                <Text style={styles.okButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.container}>
          {/* Header Section */}
          <LinearGradient 
            colors={['#FFB6C1', '#FFC1CC']} 
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.scoreContainer}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.scoreText}>{score}</Text>
              </View>
            </View>
            
            <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
            </View>
          </LinearGradient>

          {/* Question Card */}
          <View style={styles.contentArea}>
            <View style={styles.questionCard}>
              <View style={styles.questionBadge}>
                <Ionicons name="help-circle" size={20} color="#7BE7CE" />
                <Text style={styles.questionBadgeText}>Question</Text>
              </View>
              
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              
              {images.length > 0 ? (
                <View style={styles.optionsRow}>
                  {images.map((imgObj, i) => (
                    <View key={i} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imgObj.url }}
                        style={styles.image}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noImagesText}>
                  No images available
                </Text>
              )}
            </View>

            {/* Recording Button */}
            <View style={styles.recordingSection}>
              {!isRecording ? (
                <TouchableOpacity 
                  style={styles.recordBtn} 
                  onPress={startRecording}
                  activeOpacity={0.8}
                >
                  <View style={styles.micIconContainer}>
                    <Ionicons name="mic" size={32} color="#FFF" />
                  </View>
                  <Text style={styles.recordText}>Tap to Speak</Text>
                  <Text style={styles.recordSubtext}>Say the correct number</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.stopBtn} 
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <View style={styles.pulseCircle}>
                    <View style={styles.innerPulse}>
                      <Ionicons name="stop" size={28} color="#FFF" />
                    </View>
                  </View>
                  <Text style={styles.recordingText}>Recording...</Text>
                  <Text style={styles.recordSubtext}>Tap to stop</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFB6C1', // Matches header start color
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  noImagesText: { 
    textAlign: "center", 
    marginVertical: 20, 
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },

  // Header Styles (Copied from VegetableQuizzes)
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD54F',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Content Area (Adapted for Counting Quiz)
  contentArea: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7F4',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7BE7CE',
    marginLeft: 6,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center', // Center the question text
  },
  optionsRow: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    flexWrap: 'wrap', // Allow images to wrap if there are too many
    gap: 10,
    marginVertical: 10,
  },
  imageWrapper: {
    padding: 5,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: { 
    width: 80, 
    height: 80, 
    resizeMode: "contain", 
    borderRadius: 5 
  },
  
  // Recording Section (Copied from VegetableQuizzes)
  recordingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordBtn: {
    backgroundColor: '#7BE7CE',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#7BE7CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 200,
  },
  micIconContainer: {
    marginBottom: 12,
  },
  recordText: { 
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  recordSubtext: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  stopBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 200,
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  innerPulse: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Result Screen Styles (Copied from VegetableQuizzes)
  resultContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  trophyContainer: {
    marginBottom: 16,
  },
  trophyEmoji: {
    fontSize: 64,
  },
  resultTitle: { 
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#7BE7CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    elevation: 4,
    shadowColor: '#7BE7CE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scorePercentage: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
  },
  scoreLabelText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 4,
  },
  starsRow: { 
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  starWrapper: {
    padding: 8,
  },
  messageBox: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 28,
  },
  rewardMessage: { 
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
    fontWeight: '500',
  },
  okButton: { 
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7BE7CE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  okButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: { 
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CountingQuizzes;