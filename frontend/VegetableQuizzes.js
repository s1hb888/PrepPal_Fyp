import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf";

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const VegetableQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quizVegetables/`);
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
    if (quizzes.length > 0) {
      const q = quizzes[currentQuizIndex].questions[currentQuestionIndex];
      if (q?.question) Speech.speak(q.question);
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes]);

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
      console.log("Spoken:", spoken);

      const currentQuiz = quizzes[currentQuizIndex];
      const currentQuestion = currentQuiz.questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(currentQuestion.winner);

      if (spoken.includes(correctAnswer)) {
        Speech.speak("✅ Correct!");
        setScore((s) => s + 1);
        handleNext();
      } else {
        Speech.speak(`❌ Wrong! Correct answer: ${currentQuestion.winner}`);
        handleNext();
      }
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Speech.speak("Error understanding your answer.");
    }
  };

  const handleNext = () => {
    const isLastQuestion =
      currentQuestionIndex === quizzes[currentQuizIndex].questions.length - 1;
    if (isLastQuestion) {
      const isLastQuiz = currentQuizIndex === quizzes.length - 1;
      if (isLastQuiz) {
        Speech.speak(`You finished! Score: ${score}`);
        Alert.alert(
          "Quiz Complete",
          `You scored ${score} out of ${quizzes[currentQuizIndex].questions.length}`
        );
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
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options?.image_url && (
          <Image
            source={{ uri: currentQuestion.options.image_url }}
            style={styles.image}
          />
        )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  score: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD54F",
    marginBottom: 10,
    textAlign: "center",
    paddingTop: 20,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFB6C1",
    marginBottom: 20,
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: "#7BE7CE",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 10,
  },
  recordBtn: {
    marginTop: 30,
    backgroundColor: "#FFD54F",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  stopBtn: {
    marginTop: 30,
    backgroundColor: "#FFB6C1",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  recordText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default VegetableQuizzes;
