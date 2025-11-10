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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "nTmqKSP4x1kaFTCdEyAsYv3tQ6Vk4Stm";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const ShapeQuizzes = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [hintIndex, setHintIndex] = useState(0);

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

  useEffect(() => {
    if (quizzes.length === 0) return;
    const question = quizzes[0]?.questions[currentQuestionIndex];
    if (question) Speech.speak(question.hints[hintIndex].text);
  }, [currentQuestionIndex, hintIndex, quizzes]);

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
          setHintIndex(1);
        } else {
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
  setHintIndex(0);

  if (nextIndex >= quizzes[0].questions.length) {
    const totalQuestions = quizzes[0].questions.length;
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

    // ✅ Speak the reward message aloud
    Speech.speak(message);
  } else {
    setCurrentQuestionIndex(nextIndex);
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

  if (!quizzes.length || !quizzes[0].questions.length)
    return (
      <View style={styles.center}>
        <Text>No quizzes found.</Text>
      </View>
    );

  const question = quizzes[0].questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {finalScore !== null ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🎉 Quiz Complete!</Text>
          <Text style={styles.resultScore}>Score: {finalScore.toFixed(0)}%</Text>

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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
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

  // Result screen styles
  resultContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  resultTitle: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  resultScore: { fontSize: 22, color: "#FFB6C1", marginBottom: 20 },
  starsRow: { flexDirection: "row", marginBottom: 20 },
  rewardMessage: { fontSize: 18, textAlign: "center", color: "#555", paddingHorizontal: 20, marginBottom: 30 },
  okButton: { backgroundColor: "#7BE7CE", paddingVertical: 12, paddingHorizontal: 50, borderRadius: 25, elevation: 3 },
  okButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

export default ShapeQuizzes;
