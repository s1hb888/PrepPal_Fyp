import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "./config";
import { Audio } from "expo-av";
import axios from "axios";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const TEXT = "#000000";
const RED = "#EF3349";
const GREEN = "#23B26D";
const boxColors = ["#FFC1CC", "#7BE7CE", "#FFD54F", "#FFB6C1"];
const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf"; // 🔐 replace with valid key

// Smarter normalization
const normalizeRaw = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove punctuation/spaces
    .trim();

export default function QuizScreen({ route }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const { subject = "General", quizText = [], quizId = null } = route?.params || {};
  const subjectLower = (subject || "").toString().toLowerCase();

  const cleanQuiz = useMemo(() => {
    if (!Array.isArray(quizText)) return [];
    return quizText.map((q) => ({
      question: q.question || "",
      correctAnswer: q.correctAnswer || q.answer || "",
      options: Array.isArray(q.options)
        ? q.options.map((o) => ({
            text: o.text || "",
            imageUrl: o.imageUrl || null,
          }))
        : [],
      imageUrl: q.imageUrl || null,
    }));
  }, [quizText]);

  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questionStart, setQuestionStart] = useState(Date.now());

  const score = useMemo(
    () => answers.filter(Boolean).filter((a) => a.isCorrect).length,
    [answers]
  );

  useEffect(() => {
    setAnswers([]);
    setCurrent(0);
    setFinished(false);
    setFeedback(null);
    setSelected(null);
    setQuestionStart(Date.now());
  }, [cleanQuiz.length]);

  useEffect(() => {
    if (cleanQuiz?.length > 0 && cleanQuiz[current]) {
      const qtext = cleanQuiz[current].question || "";
      const lang = subjectLower === "urdu" ? "ur" : "en";
      Speech.stop();
      Speech.speak(qtext, { language: lang });
      setQuestionStart(Date.now());
    }
  }, [current, cleanQuiz, subjectLower]);

  const saveResults = async (finalAnswers, finalScore) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Unauthorized", "Please login first.");
      const payload = {
        quizId: quizId || null,
        score: finalScore,
        total: cleanQuiz.length,
        answers: finalAnswers.filter(Boolean),
      };
      const res = await axios.post(`${API_BASE_URL}/api/result/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("✅ Result Saved", "Your quiz results have been submitted!");
      console.log("Saved:", res.data);
    } catch (e) {
      console.error("Save error:", e.response?.data || e);
    }
  };

  const handleAnswer = (optionClicked) => {
    if (selected || finished) return;
    const q = cleanQuiz[current];
    if (!q) return;
    const timeTakenMs = Date.now() - questionStart;

    const isCorrect =
      normalizeRaw(optionClicked.text) === normalizeRaw(q.correctAnswer);

    setSelected(optionClicked.text);
    const nextAnswers = [...answers];
    nextAnswers[current] = {
      question: q.question,
      selected: optionClicked.text,
      correctAnswer: q.correctAnswer,
      isCorrect,
      timeTaken: timeTakenMs,
    };
    setAnswers(nextAnswers);
    setFeedback(isCorrect ? "✅ Correct!" : "❌ Wrong!");
    Speech.speak(isCorrect ? "Correct!" : "Wrong!", {
      language: subjectLower === "urdu" ? "ur" : "en",
    });

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (current + 1 < cleanQuiz.length) {
        setQuestionStart(Date.now());
        setCurrent((c) => c + 1);
      } else {
        setFinished(true);
        const finalScore = nextAnswers.filter((a) => a.isCorrect).length;
        saveResults(nextAnswers, finalScore);
      }
    }, 800);
  };

  // 🎤 Start new recording safely
  const startRecording = async () => {
    try {
      console.log("🎙 Starting fresh recording...");
      if (recording) {
        await recording.stopAndUnloadAsync().catch(() => {});
        await FileSystem.deleteAsync(recording.getURI(), { idempotent: true }).catch(() => {});
        setRecording(null);
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newFile = `${FileSystem.cacheDirectory}recording_${Date.now()}.m4a`;
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      rec.setOnRecordingStatusUpdate(null);
      setRecording(rec);
      setIsRecording(true);
      console.log("✅ Recording started at:", newFile);
    } catch (e) {
      console.error("Start record error:", e);
    }
  };

  // 🛑 Stop and send
  const stopRecording = async () => {
    try {
      if (!recording) return;
      console.log("🛑 Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("🎧 File ready:", uri);

      setIsRecording(false);
      setRecording(null);

      if (uri) await sendToLemonFox(uri);
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      console.log("🗑 Cleaned up:", uri);
    } catch (e) {
      console.error("Stop record error:", e);
    }
  };

  // 🍋 Send to LemonFox API
  const sendToLemonFox = async (uri) => {
    try {
      console.log("📤 Sending audio to LemonFox...");
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "speech.m4a",
        type: "audio/m4a",
      });
      formData.append("language", "english");
      formData.append("response_format", "json");

      const res = await fetch("https://api.lemonfox.ai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LEMONFOX_API_KEY}` },
        body: formData,
      });

      const data = await res.json();
      console.log("🧠 LemonFox Response:", data);

      const spoken = normalizeRaw(data.text || "");
      console.log("🎤 You said (cleaned):", spoken);

      if (!spoken) {
        Speech.speak("I couldn't catch that, please repeat.");
        return;
      }

      const q = cleanQuiz[current];
      const matched = q.options.find(
        (opt) =>
          normalizeRaw(spoken).includes(normalizeRaw(opt.text)) ||
          normalizeRaw(opt.text).includes(normalizeRaw(spoken))
      );

      if (matched) {
        console.log("✅ Matched:", matched.text);
        handleAnswer(matched);
      } else {
        console.warn("⚠️ No match for:", spoken);
        Speech.speak("Please try again, I didn’t understand your answer.");
      }
    } catch (e) {
      console.error("LemonFox error:", e);
      Speech.speak("Error understanding your answer.");
    }
  };

  const restartQuiz = async () => {
    console.log("♻️ Restarting...");
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => {});
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    setRecording(null);
    setIsRecording(false);
    setCurrent(0);
    setFinished(false);
    setFeedback(null);
    setSelected(null);
    setAnswers(Array(cleanQuiz.length).fill(null));
    setQuestionStart(Date.now());
  };

  if (!cleanQuiz?.length)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>No quiz available</Text>
      </View>
    );

  const q = cleanQuiz[current];

  return (
    <View style={styles.container}>
      <Text style={styles.subject}>
        {subject} Quiz ({current + 1}/{cleanQuiz.length})
      </Text>
      <Text style={styles.question}>{q.question}</Text>

      {q.imageUrl && <Image source={{ uri: q.imageUrl }} style={styles.questionImage} />}

      <View style={styles.recordContainer}>
        {!isRecording ? (
          <TouchableOpacity onPress={startRecording} style={styles.startBtn}>
            <Text style={styles.btnText}>🎤 Speak Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopRecording} style={styles.stopBtn}>
            <Text style={styles.btnText}>🛑 Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={q.options}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        renderItem={({ item, index }) => {
          const isChosen = selected === item.text;
          const isRight =
            normalizeRaw(item.text) === normalizeRaw(q.correctAnswer);
          let bg = boxColors[index % boxColors.length];
          if (isChosen) bg = isRight ? GREEN : RED;
          return (
            <TouchableOpacity
              onPress={() => handleAnswer(item)}
              style={[styles.optionBox, { backgroundColor: bg }]}
            >
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.optionImage} />
              )}
              <Text style={styles.optionText}>{item.text}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.optionsContainer}
      />

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}

      {finished && (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Your score: {score}/{cleanQuiz.length}
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restartQuiz}>
            <Text style={styles.restartText}>🔄 Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF8F8" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 18, color: TEXT },
  subject: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 12, color: RED },
  question: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center", color: TEXT },
  questionImage: { width: 120, height: 120, alignSelf: "center", marginBottom: 20 },
  recordContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  startBtn: { backgroundColor: GREEN, padding: 12, borderRadius: 8, marginHorizontal: 8 },
  stopBtn: { backgroundColor: RED, padding: 12, borderRadius: 8, marginHorizontal: 8 },
  btnText: { color: "#fff", fontWeight: "bold" },
  optionsContainer: { justifyContent: "center", alignItems: "center" },
  optionBox: {
    width: "45%",
    aspectRatio: 1,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 4,
    padding: 10,
  },
  optionImage: { width: 60, height: 60, marginBottom: 8 },
  optionText: { fontSize: 18, color: TEXT, fontWeight: "700", textAlign: "center" },
  feedback: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: 20, color: RED },
  restartBtn: { marginTop: 10, padding: 12, backgroundColor: "#222", borderRadius: 8 },
  restartText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
