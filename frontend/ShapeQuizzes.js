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
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const ShapeQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [hintIndex, setHintIndex] = useState(0); // 0 = first hint, 1 = second hint

  const correctSound = useRef(new Audio.Sound());
  const wrongSound = useRef(new Audio.Sound());

  // Load sounds
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

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/quizShape/`);
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Speak current hint
  useEffect(() => {
    if (quizzes.length === 0) return;
    const question = quizzes[0]?.questions[currentQuestionIndex];
    if (question) {
      Speech.speak(question.hints[hintIndex].text);
    }
  }, [currentQuestionIndex, hintIndex, quizzes]);

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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

  // Stop recording
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

  // LemonFox transcription
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
      const question = quizzes[0].questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(question.shapeName);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHighlightedWord(question.shapeName);

      if (spoken.includes(correctAnswer)) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
        setTimeout(() => {
          setHighlightedWord(null);
          nextQuestion();
        }, 2000);
      } else {
        if (hintIndex === 0 && question.hints[1]) {
          // Show second hint
          setHintIndex(1);
        } else {
          // Wrong answer after second hint, move next
          await wrongSound.current.replayAsync();
          setTimeout(() => {
            setHighlightedWord(null);
            nextQuestion();
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Alert.alert("Error", "Could not understand your answer.");
    }
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setHintIndex(0); // Reset hint for next question
    if (nextIndex >= quizzes[0].questions.length) {
      Alert.alert(
        "Quiz Complete",
        `You scored ${score} out of ${quizzes[0].questions.length}`
      );
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );

  if (!quizzes.length || !quizzes[0].questions.length)
    return (
      <View style={styles.center}>
        <Text>No quizzes found.</Text>
      </View>
    );

  const question = quizzes[0].questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.quizTitle}>Shapes Quiz</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.hints[hintIndex].text}</Text>
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
        {highlightedWord && (
          <Text style={styles.highlightedText}>Correct: {highlightedWord}</Text>
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
  score: { fontSize: 22, fontWeight: "bold", color: "#FFD54F", marginBottom: 10, textAlign: "center", paddingTop: 20 },
  quizTitle: { fontSize: 24, fontWeight: "bold", color: "#FFB6C1", marginBottom: 20, textAlign: "center" },
  questionCard: { backgroundColor: "#7BE7CE", borderRadius: 15, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, elevation: 3, width: "100%" },
  questionText: { fontSize: 18, color: "#333", marginBottom: 10, textAlign: "center" },
  highlightedText: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "#FF6B6B" },
  image: { width: "100%", height: 180, resizeMode: "contain", borderRadius: 10, marginBottom: 10 },
  recordBtn: { marginTop: 30, backgroundColor: "#FFD54F", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  stopBtn: { marginTop: 30, backgroundColor: "#FFB6C1", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  recordText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ShapeQuizzes;
