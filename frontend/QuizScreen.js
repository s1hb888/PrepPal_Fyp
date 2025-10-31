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
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';

const TEXT = "#000000";
const RED = "#EF3349";
const GREEN = "#23B26D";
const PINK = "#FFC1CC";
const MINT = "#A0F0DC";
const YELLOW = "#FFE680";
const LIGHT_PINK = "#FFB6C1";

const boxColors = [PINK, MINT, YELLOW, LIGHT_PINK];
const LEMONFOX_API_KEY = "JVTxkQ2MhlB2s3wyynOS5FW0fz9xLetf";

const normalizeRaw = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .replace(/[\s.,!?؛،؟]/g, "")
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
      if (!token) {
        return Alert.alert("Unauthorized", "Please login first.");
      }

      const payload = {
        quizId: quizId || null,
        score: finalScore,
        total: cleanQuiz.length,
        answers: finalAnswers.filter(Boolean),
      };

      const res1 = await axios.post(`${API_BASE_URL}/api/result/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Result saved:", res1.data);

      const res2 = await axios.post(
        `${API_BASE_URL}/api/quiz/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("🔁 Performance refreshed:", res2.data);

      Alert.alert(
        "✅ Quiz Complete",
        "Results saved and performance updated successfully!"
      );
    } catch (e) {
      console.error("❌ Save or Refresh error:", e.response?.data || e);
      Alert.alert("Error", "Failed to save or refresh results.");
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
    Speech.speak(
      isCorrect
        ? subjectLower === "urdu" ? "صحیح!" : "Correct!"
        : subjectLower === "urdu" ? "غلط!" : "Wrong!",
      { language: subjectLower === "urdu" ? "ur" : "en" }
    );

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

  const sendToLemonFox = async (uri) => {
    try {
      console.log("📤 Sending audio to LemonFox...");
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "speech.m4a",
        type: "audio/m4a",
      });

      const langCode = subjectLower === "urdu" ? "urdu" : "english";
      formData.append("language", langCode);
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
        Speech.speak(subjectLower === "urdu" ? "میں سمجھ نہیں پایا، دوبارہ کہیے۔" : "I couldn't catch that, please repeat.", {
          language: langCode,
        });
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
        Speech.speak(
          subjectLower === "urdu" ? "براہ کرم دوبارہ کوشش کریں، میں آپ کا جواب سمجھ نہیں پایا۔" : 
          "Please try again, I didn't understand your answer.",
          { language: langCode }
        );
      }
    } catch (e) {
      console.error("LemonFox error:", e);
      Speech.speak(subjectLower === "urdu" ? "جواب سمجھنے میں خرابی۔" : "Error understanding your answer.", {
        language: subjectLower === "urdu" ? "ur" : "en",
      });
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
      {/* Results Full Screen Overlay */}
      {finished && (
        <View style={styles.fullScreenResults}>
          <LinearGradient colors={[PINK, LIGHT_PINK]} style={styles.fullScreenGradient}>
            <View style={styles.resultsBubble1} />
            <View style={styles.resultsBubble2} />
            <View style={styles.resultsBubble3} />
            
            <View style={styles.resultsContent}>
              <Ionicons name="trophy" size={80} color={RED} />
              <Text style={styles.completionTitle}>Quiz Complete!</Text>
              <Text style={styles.completionScore}>
                Your Score: {score}/{cleanQuiz.length}
              </Text>
              
              <TouchableOpacity style={styles.fullScreenRestartButton} onPress={restartQuiz}>
                <LinearGradient colors={[MINT, '#7BE7CE']} style={styles.fullScreenRestartGradient}>
                  <Ionicons name="refresh" size={24} color="#000" />
                  <Text style={styles.fullScreenRestartText}>Restart Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {!finished && (
        <>
          {/* Decorative Bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.bubble3} />
          <View style={styles.bubble4} />
          <View style={styles.bubble5} />

          {/* Header */}
          <LinearGradient colors={[PINK, LIGHT_PINK]} style={styles.header}>
            <Text style={styles.subject}>{subject} Quiz</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((current + 1) / cleanQuiz.length) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {current + 1}/{cleanQuiz.length}
              </Text>
            </View>
          </LinearGradient>

          {/* Content Card */}
          <View style={styles.contentCard}>
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{q.question}</Text>
              {q.imageUrl && <Image source={{ uri: q.imageUrl }} style={styles.questionImage} />}
            </View>

            {/* Feedback - positioned before options */}
            {feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedback}>{feedback}</Text>
              </View>
            )}

            {/* Voice Recording Button */}
            <View style={styles.recordContainer}>
              {!isRecording ? (
                <TouchableOpacity onPress={startRecording} style={styles.recordButton}>
                  <LinearGradient colors={[MINT, '#7BE7CE']} style={styles.recordGradient}>
                    <Ionicons name="mic" size={20} color="#000" />
                    <Text style={styles.recordText}>Speak Answer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={stopRecording} style={styles.recordButton}>
                  <LinearGradient colors={[RED, '#D32F2F']} style={styles.recordGradient}>
                    <Ionicons name="stop-circle" size={20} color="#fff" />
                    <Text style={[styles.recordText, { color: '#fff' }]}>Stop Recording</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Options Grid */}
            <FlatList
              data={q.options}
              keyExtractor={(_, i) => i.toString()}
              numColumns={2}
              renderItem={({ item, index }) => {
                const isChosen = selected === item.text;
                const isRight = normalizeRaw(item.text) === normalizeRaw(q.correctAnswer);
                let bg = boxColors[index % boxColors.length];
                if (isChosen) bg = isRight ? GREEN : RED;
                
                return (
                  <TouchableOpacity
                    onPress={() => handleAnswer(item)}
                    style={styles.optionWrapper}
                    disabled={selected !== null}
                  >
                    <View style={[styles.optionBox, { backgroundColor: bg }]}>
                      <View style={styles.optionBubble1} />
                      <View style={styles.optionBubble2} />
                      {item.imageUrl && (
                        <Image source={{ uri: item.imageUrl }} style={styles.optionImage} />
                      )}
                      <Text style={styles.optionText}>{item.text}</Text>
                      {isChosen && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons 
                            name={isRight ? "checkmark-circle" : "close-circle"} 
                            size={24} 
                            color="#fff" 
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.optionsContainer}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: '#fff',
  },
  loading: { 
    fontSize: 18, 
    color: TEXT,
    fontWeight: '600',
  },
  
  // Full Screen Results
  fullScreenResults: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullScreenGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultsContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsBubble1: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  resultsBubble2: {
    position: 'absolute',
    bottom: 100,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  resultsBubble3: {
    position: 'absolute',
    top: 200,
    left: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  completionTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: TEXT,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  completionScore: {
    fontSize: 32,
    fontWeight: '700',
    color: RED,
    marginBottom: 40,
    textAlign: 'center',
  },
  fullScreenRestartButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fullScreenRestartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    gap: 12,
  },
  fullScreenRestartText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Decorative Bubbles
  bubble1: { 
    position: 'absolute', 
    top: -30, 
    right: -30, 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(160, 240, 220, 0.15)',
    zIndex: 0,
  },
  bubble2: { 
    position: 'absolute', 
    top: 100, 
    left: -40, 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255, 193, 204, 0.12)',
    zIndex: 0,
  },
  bubble3: { 
    position: 'absolute', 
    bottom: 150, 
    right: 20, 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255, 230, 128, 0.15)',
    zIndex: 0,
  },
  bubble4: { 
    position: 'absolute', 
    bottom: 100, 
    left: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(160, 240, 220, 0.1)',
    zIndex: 0,
  },
  bubble5: { 
    position: 'absolute', 
    top: 200, 
    right: 40, 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: 'rgba(255, 193, 204, 0.08)',
    zIndex: 0,
  },
  
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
  },
  subject: { 
    fontSize: 26, 
    fontWeight: "800", 
    textAlign: "center", 
    marginBottom: 15, 
    color: TEXT,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RED,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  
  // Content Card
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 20,
    elevation: 3,
    zIndex: 1,
  },
  
  // Question
  questionContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  question: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    color: TEXT,
    marginBottom: 10,
  },
questionImage: {
  width: '50%',
  height: undefined,
  aspectRatio: 1, 
  resizeMode: 'contain', 
  borderRadius: 12,
  borderWidth: 3,
  borderColor: MINT,
  marginVertical: 8,
},

  
  // Feedback
  feedbackContainer: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 30,
  },
  feedback: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: RED,
  },
  
  // Recording
  recordContainer: { 
    alignItems: 'center',
    marginBottom: 15,
  },
  recordButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  recordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  recordText: { 
    color: '#000', 
    fontWeight: "bold",
    fontSize: 14,
  },
  
  // Options
  optionsContainer: { 
    paddingBottom: 20,
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 10,
    marginHorizontal: '1%',
  },
  optionBox: {
    height: 100,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 4,
    padding: 10,
    overflow: 'hidden',
  },
  optionBubble1: {
    position: 'absolute',
    top: -5,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  optionBubble2: {
    position: 'absolute',
    bottom: 5,
    left: 15,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  optionImage: { 
    width: 50, 
    height: 50, 
    marginBottom: 6,
    borderRadius: 8,
  },
  optionText: { 
    fontSize: 14, 
    color: TEXT, 
    fontWeight: "700", 
    textAlign: "center",
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});