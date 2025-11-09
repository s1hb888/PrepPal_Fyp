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
  Dimensions,
  FlatList,
} from "react-native";
import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import API_BASE_URL from "./config";
import { Ionicons } from "@expo/vector-icons";

const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf";
const { width } = Dimensions.get("window");

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const ColorQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);

  const [finalScore, setFinalScore] = useState(null);
  const [earnedStars, setEarnedStars] = useState(0);
  const [rewardMessage, setRewardMessage] = useState("");

  const animValue = useRef(new Animated.Value(0)).current;

  // Preload sounds
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
        const response = await axios.get(`${API_BASE_URL}/api/quizColor/`);
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

  // Speak question aloud whenever current question changes
  useEffect(() => {
    if (quizzes.length === 0) return;
    const currentQuestion = quizzes[currentQuizIndex]?.questions[currentQuestionIndex];
    if (currentQuestion?.question) {
      Speech.speak(currentQuestion.question);
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes]);

  useEffect(() => {
    if (quizzes.length > 0 && quizzes[currentQuizIndex]?.questions.length > 0) {
      animValue.setValue(0); // reset animation
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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
      const correctAnswer = normalizeRaw(currentQuestion.correct_answer);

      if (spoken.includes(correctAnswer)) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
      } else {
        await wrongSound.current.replayAsync();
      }

      // Animate out the current question
      Animated.timing(animValue, {
        toValue: width,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        handleNext(spoken.includes(correctAnswer));
      });
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
    }
  };

  const handleNext = (isCorrect) => {
    const currentQuiz = quizzes[currentQuizIndex];
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

    if (isLastQuestion) {
      const isLastQuiz = currentQuizIndex === quizzes.length - 1;
      if (isLastQuiz) {
        // Calculate final score & stars
        const totalQuestions = currentQuiz.questions.length;
        const scorePercent = ((score + (isCorrect ? 1 : 0)) / totalQuestions) * 100;

        let stars = 0;
        let message = "";

        if (scorePercent >= 90) {
          stars = 3;
          message = "Excellent! You earned 3 Gold Stars ⭐⭐⭐";
        } else if (scorePercent >= 80) {
          stars = 2;
          message = "Great! You earned 2 Gold Stars ⭐⭐";
        } else if (scorePercent >= 70) {
          stars = 1;
          message = "Good! You earned 1 Gold Star ⭐";
        } else if (scorePercent >= 60) {
          stars = 0;
          message = "Well done! You’re one step away from earning a star.";
        } else if (scorePercent > 50) {
          stars = 0;
          message = "Good effort! Keep trying.";
        } else if (scorePercent === 50) {
          stars = 0;
          message = "You passed!";
          Speech.speak("You passed!");
        } else {
          stars = 0;
          message = "Don’t worry, you’ll do better next time!";
        }

        setFinalScore(scorePercent);
        setEarnedStars(stars);
        setRewardMessage(message);
      } else {
        setCurrentQuizIndex((p) => p + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );

  if (quizzes.length === 0 || quizzes[currentQuizIndex]?.questions.length === 0)
    return (
      <View style={styles.center}>
        <Text>No quizzes found.</Text>
      </View>
    );

  const currentQuiz = quizzes[currentQuizIndex];
  const question = currentQuiz.questions[currentQuestionIndex];
  const upcomingQuestions = currentQuiz.questions.filter((_, i) => i !== currentQuestionIndex);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>

      <Animated.View style={[styles.questionCard, { transform: [{ translateX: animValue }] }]}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.image_url && <Image source={{ uri: question.image_url }} style={styles.image} />}
      </Animated.View>

      <FlatList
        data={upcomingQuestions}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginTop: 15 }}
        renderItem={({ item }) => (
          <View style={styles.upcomingCard}>
            <Text style={styles.questionText}>{item.question}</Text>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.upcomingImage} />}
          </View>
        )}
      />

      {!isRecording ? (
        <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
          <Text style={styles.recordText}>🎤 Speak Answer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
          <Text style={styles.recordText}>⏹ Stop Recording</Text>
        </TouchableOpacity>
      )}

      {/* ✅ Display Stars and Reward Message */}
      {finalScore !== null && (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            Quiz Complete! Score: {finalScore.toFixed(0)}%
          </Text>

          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < earnedStars ? "star" : "star-outline"}
                size={40}
                color="#FFD700"
                style={{ marginHorizontal: 5 }}
              />
            ))}
          </View>

          <Text style={{ fontSize: 16, textAlign: "center" }}>{rewardMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  score: { fontSize: 22, fontWeight: "bold", color: "#FFD54F", marginBottom: 10, textAlign: "center", paddingTop: 20 },
  quizTitle: { fontSize: 24, fontWeight: "bold", color: "#FFB6C1", marginBottom: 20, textAlign: "center" },

  questionCard: {
    backgroundColor: "#7BE7CE",
    borderRadius: 15,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    height: 200,
    marginBottom: 15,
  },

  questionText: { fontSize: 18, color: "#333", marginBottom: 8, textAlign: "center" },
  image: { width: "100%", height: 120, resizeMode: "contain", borderRadius: 10, marginBottom: 5 },

  upcomingCard: {
    backgroundColor: "#D1F2EB",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    marginBottom: 12,
    height: 150,
  },
  upcomingImage: { width: "100%", height: 60, resizeMode: "contain", borderRadius: 8, marginTop: 5 },

  recordBtn: { marginTop: 20, backgroundColor: "#FFD54F", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  stopBtn: { marginTop: 20, backgroundColor: "#FFB6C1", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  recordText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ColorQuizzes;
