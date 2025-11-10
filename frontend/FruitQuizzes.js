// screens/FruitQuizzes.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
} from "react-native";
import axios from "axios";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "nTmqKSP4x1kaFTCdEyAsYv3tQ6Vk4Stm";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const { width } = Dimensions.get("window");
const TRACK_LENGTH = width - 120;

const FruitQuizzes = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [sortedOptions, setSortedOptions] = useState([]);
  const animations = useRef([]).current;

  const [finalScore, setFinalScore] = useState(null);
  const [earnedStars, setEarnedStars] = useState(0);
  const [rewardMessage, setRewardMessage] = useState("");

  const correctSound = useRef(new Audio.Sound());
  const wrongSound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await correctSound.current.loadAsync(require("../assets/sounds/answer-correct.mp3"));
        await wrongSound.current.loadAsync(require("../assets/sounds/buzzer-new.mp3"));
      } catch (err) {
        console.error("Failed to load sounds:", err);
      }
    };
    loadSounds();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quizFruit/`);
        setQuizzes(response.data);
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
    const q = quizzes[currentQuizIndex].questions[currentQuestionIndex];
    if (!q) return;

    if (q.question) Speech.speak(q.question);

    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    setSortedOptions(shuffled);

    shuffled.forEach((_, i) => {
      if (!animations[i]) animations[i] = new Animated.Value(0);
      else animations[i].setValue(0);
    });

    startRaceAnimation(shuffled, q.winner);
  }, [currentQuizIndex, currentQuestionIndex, quizzes, finalScore]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
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
      Alert.alert("Error", "Recording permission not granted.");
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

      const res = await fetch("https://api.lemonfox.ai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LEMONFOX_API_KEY}` },
        body: formData,
      });

      const data = await res.json();
      const spoken = normalizeRaw(data.text || "");
      const currentQuiz = quizzes[currentQuizIndex];
      const currentQuestion = currentQuiz.questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(currentQuestion.winner);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHighlightedWord(currentQuestion.winner);

      if (spoken.includes(correctAnswer)) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
      } else {
        await wrongSound.current.replayAsync();
      }

      setTimeout(() => {
        setHighlightedWord(null);
        handleNext();
      }, 3000);
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Speech.speak("Error understanding your answer.");
    }
  };

  const startRaceAnimation = (options, winnerWord) => {
    if (!options || options.length === 0) return;

    options.forEach((item, index) => {
      const isWinner = item.word === winnerWord;
      const distance = isWinner ? TRACK_LENGTH : TRACK_LENGTH * (0.5 + Math.random() * 0.1);
      const duration = isWinner ? 1800 + Math.random() * 200 : 3500 + Math.random() * 200;

      Animated.timing(animations[index], {
        toValue: distance,
        duration,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    const isLastQuestion =
      currentQuestionIndex === quizzes[currentQuizIndex].questions.length - 1;
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
}
 else {
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

  if (quizzes.length === 0)
    return (
      <View style={styles.center}>
        <Text>No quizzes found.</Text>
      </View>
    );

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {finalScore !== null ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🎉 Quiz Complete!</Text>
          <Text style={styles.resultScore}>
            Score: {finalScore.toFixed(0)}%
          </Text>

          <View style={styles.starsRow}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < earnedStars ? "star" : "star-outline"}
                size={50}
                color="#FFD700"
                style={{ marginHorizontal: 5 }}
              />
            ))}
          </View>

          <Text style={styles.rewardMessage}>{rewardMessage}</Text>

          <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.score}>🌟 Score: {score}</Text>
          <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {sortedOptions.map((item, index) => (
              <View key={index} style={styles.raceTrack}>
                <Animated.View
                  style={[
                    styles.imageContainer,
                    { transform: [{ translateX: animations[index] }] },
                    highlightedWord === item.word && styles.highlightedImage,
                  ]}
                >
                  {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                  )}
                </Animated.View>
                <Text
                  style={[
                    styles.optionText,
                    highlightedWord === item.word && styles.highlightedText,
                  ]}
                >
                  {item.word}
                </Text>
              </View>
            ))}
          </View>

          {!isRecording ? (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <Text style={styles.recordText}>🎤 Speak Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Text style={styles.recordText}>⏹ Stop Recording</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  score: { fontSize: 20, fontWeight: "bold", color: "#7BE7CE", textAlign: "center", marginTop: 20 },
  quizTitle: { fontSize: 22, fontWeight: "bold", color: "#FFB6C1", textAlign: "center", marginVertical: 10 },
  questionCard: { backgroundColor: "#FFFFFFE0", borderRadius: 15, padding: 15, alignItems: "flex-start", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, width: "100%" },
  questionText: { fontSize: 18, color: "#333", marginBottom: 15, textAlign: "center", width: "100%" },
  raceTrack: { width: "100%", marginVertical: 8, alignItems: "flex-start" },
  imageContainer: { backgroundColor: "#FFF", borderRadius: 10, padding: 8, shadowColor: "#000", shadowOpacity: 0.1, elevation: 3, marginBottom: 5 },
  highlightedImage: { backgroundColor: "#FFD54F", shadowColor: "#FFD54F", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  image: { width: 60, height: 60, resizeMode: "contain" },
  optionText: { fontSize: 14, color: "#333", fontWeight: "600", textAlign: "left", marginLeft: 5 },
  highlightedText: { color: "#FF6B6B", fontWeight: "bold", fontSize: 16 },
  recordBtn: { marginTop: 20, backgroundColor: "#7BE7CE", paddingVertical: 10, borderRadius: 10, alignItems: "center", elevation: 3 },
  stopBtn: { marginTop: 20, backgroundColor: "#FFB6C1", paddingVertical: 10, borderRadius: 10, alignItems: "center", elevation: 3 },
  recordText: { color: "#333", fontSize: 15, fontWeight: "bold" },

  // Result screen styles
  resultContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  resultTitle: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  resultScore: { fontSize: 22, color: "#FFB6C1", marginBottom: 20 },
  starsRow: { flexDirection: "row", marginBottom: 20 },
  rewardMessage: { fontSize: 18, textAlign: "center", color: "#555", paddingHorizontal: 20, marginBottom: 30 },
  okButton: { backgroundColor: "#7BE7CE", paddingVertical: 12, paddingHorizontal: 50, borderRadius: 25, elevation: 3 },
  okButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

export default FruitQuizzes;
