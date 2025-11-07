// screens/CountingQuizzes.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech"; // <-- import expo-speech
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf";

const normalizeRaw = (text = "") => text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const CountingQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);

  // Sound refs
  const correctSound = useRef(new Audio.Sound());
  const wrongSound = useRef(new Audio.Sound());

  // ------------------- Load sounds -------------------
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

  // ------------------- Fetch quizzes -------------------
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quizCounting/`);
        const normalized = response.data.map((quiz) => ({
          ...quiz,
          questions: quiz.questions.map((q) => ({
            ...q,
            images: Array.isArray(q.images)
              ? q.images.map((img) => ({ url: img.url || img.image_url || img }))
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

  // ------------------- Speak the current question -------------------
  useEffect(() => {
    if (quizzes.length === 0) return;
    const currentQuestion = quizzes[currentQuizIndex]?.questions[currentQuestionIndex];
    if (currentQuestion?.question) {
      Speech.speak(currentQuestion.question, { language: "en" });
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes]);

  // ------------------- Recording -------------------
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Microphone permission not granted!");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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

  // ------------------- LemonFox transcription + feedback -------------------
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
      const currentQuestion = quizzes[currentQuizIndex]?.questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(currentQuestion.answer);

      if (spoken.includes(correctAnswer)) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
      } else {
        await wrongSound.current.replayAsync();
      }
      handleNext();
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Alert.alert("Error", "Could not understand your answer.");
    }
  };

  // ------------------- Next question -------------------
  const handleNext = () => {
    const currentQuiz = quizzes[currentQuizIndex];
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

    if (isLastQuestion) {
      const isLastQuiz = currentQuizIndex === quizzes.length - 1;
      if (isLastQuiz) {
        Alert.alert("Quiz Complete", `You scored ${score} out of ${currentQuiz.questions.length}`);
      } else {
        setCurrentQuizIndex((p) => p + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  // ------------------- Loading / Empty -------------------
  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FFD54F" />
    </View>
  );

  if (!quizzes.length) return (
    <View style={styles.center}>
      <Text>No quizzes found.</Text>
    </View>
  );

  // ------------------- Current quiz/question -------------------
  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const images = currentQuestion?.images || [];

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>
      <Text style={styles.questionText}>{currentQuestion.question}</Text>

      {images.length > 0 ? (
        <View style={styles.optionsRow}>
          {images.map((imgObj, i) => (
            <Image key={i} source={{ uri: imgObj.url }} style={styles.image} />
          ))}
        </View>
      ) : (
        <Text style={{ textAlign: "center", marginVertical: 20 }}>No images available</Text>
      )}

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

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  score: { fontSize: 22, fontWeight: "bold", color: "#FFD54F", marginBottom: 10, textAlign: "center", paddingTop: 20 },
  quizTitle: { fontSize: 24, fontWeight: "bold", color: "#FFB6C1", marginBottom: 20, textAlign: "center" },
  questionText: { fontSize: 18, color: "#333", marginBottom: 10, textAlign: "center" },
  optionsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  image: { width: 100, height: 100, resizeMode: "contain", borderRadius: 10 },
  recordBtn: { marginTop: 30, backgroundColor: "#FFD54F", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  stopBtn: { marginTop: 30, backgroundColor: "#FFB6C1", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  recordText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default CountingQuizzes;
