import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ✅ added
import API_BASE_URL from "./config";

const LEMONFOX_API_KEY = "nTmqKSP4x1kaFTCdEyAsYv3tQ6Vk4Stm";

const normalizeRaw = (text = "") =>
  text.toString().toLowerCase().replace(/[\s.,!?؛،؟]/g, "").trim();

const BodyPartQuizzes = () => {
  const navigation = useNavigation(); // ✅ added for OK button
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

  const correctSound = useRef(new Audio.Sound());
  const wrongSound = useRef(new Audio.Sound());

  // Load sounds
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

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quizBodyParts/`);
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

  // Speak question aloud
  useEffect(() => {
    if (quizzes.length === 0 || finalScore !== null) return;
    const currentQuestion =
      quizzes[currentQuizIndex].questions[currentQuestionIndex];
    if (currentQuestion?.question) {
      Speech.speak(currentQuestion.question);
    }
  }, [currentQuizIndex, currentQuestionIndex, quizzes, finalScore]);

  // Start recording
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

  // Send to LemonFox for transcription
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
      console.log("Spoken:", spoken);

      const currentQuestion =
        quizzes[currentQuizIndex].questions[currentQuestionIndex];
      const correctAnswer = normalizeRaw(currentQuestion.answer);

      if (spoken.includes(correctAnswer)) {
        await correctSound.current.replayAsync();
        setScore((s) => s + 1);
      } else {
        await wrongSound.current.replayAsync();
      }

      setTimeout(() => handleNext(), 2000);
    } catch (err) {
      console.error("Lemonfox transcription error:", err);
      Alert.alert("Error", "Failed to process your answer.");
    }
  };

  // Move to next question
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
} else {
        setCurrentQuizIndex((p) => p + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handleOkPress = () => {
    Speech.stop();
    navigation.goBack(); // ✅ go back to previous screen
    // OR to restart quiz instead, replace with:
    // setFinalScore(null); setScore(0); setCurrentQuizIndex(0); setCurrentQuestionIndex(0);
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
      {/* ✅ Show Results Page if quiz complete */}
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

          {/* ✅ OK button added */}
          <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ✅ Show quiz content normally
        <>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.quizTitle}>{currentQuiz.quiz_title}</Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.image_url && (
              <Image
                source={{ uri: currentQuestion.image_url }}
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  recordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ✅ Results screen styles
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 22,
    color: "#FFB6C1",
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  rewardMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  // ✅ OK button
  okButton: {
    backgroundColor: "#7BE7CE",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 3,
  },
  okButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default BodyPartQuizzes;
