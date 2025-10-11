// QuizScreen.js
import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "./config";
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

const TEXT = "#000000";
const RED = "#EF3349";
const GREEN = "#23B26D";
const boxColors = ["#FFC1CC", "#7BE7CE", "#FFD54F", "#FFB6C1"];

const normalize = (t) =>
  !t ? "" : String(t).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
const normalizeRaw = (t) =>
  !t ? "" : String(t).normalize("NFC").replace(/\s+/g, " ").trim();

export default function QuizScreen({ route }) {
  const { subject = "General", quizText = [], quizId = null } =
    route?.params || {};

  const subjectLower = (subject || "").toString().toLowerCase();

  const cleanQuiz = useMemo(() => {
    if (!Array.isArray(quizText)) return [];
    return quizText.map((q) => {
      const opts = Array.isArray(q.options)
        ? q.options.map((o) => ({
            text: normalizeRaw(o.text || ""),
            imageUrl: o.imageUrl || null,
          }))
        : [];

      return {
        question: normalizeRaw(q.question || ""),
        options: opts,
        correctAnswer: normalizeRaw(q.correctAnswer || q.answer || ""),
        imageUrl: q.imageUrl || null,
      };
    });
  }, [quizText]);

  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questionStart, setQuestionStart] = useState(Date.now()); // ⏱️ Track question start time

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
      Speech.speak(qtext, { language: lang });
      setQuestionStart(Date.now()); // reset timer for new question
    }
  }, [current, cleanQuiz, subjectLower]);

  const saveResults = async (finalAnswers, finalScore) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Unauthorized", "Please login first.");
        return;
      }

      const payload = {
        quizId: quizId || null,
        score: finalScore,
        total: cleanQuiz.length, // ✅ correct total
        answers: finalAnswers.filter(Boolean), // ✅ remove nulls
      };

      console.log("📤 Sending payload:", payload);

      const response = await axios.post(
        `${API_BASE_URL}/api/result/save`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("✅ Result Saved", "Your quiz results have been submitted!");
      console.log("Result saved:", response.data);
    } catch (error) {
      console.error(
        "❌ Error saving result:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to save results. Please try again.");
    }
  };

  const handleAnswer = (optionClicked) => {
  if (selected || finished) return;
  const q = cleanQuiz[current];
  if (!q) return;

  // ✅ milli-seconds
  const timeTakenMs = Date.now() - questionStart;

  const isCorrect =
    normalize(optionClicked.text) === normalize(q.correctAnswer) ||
    normalizeRaw(optionClicked.text) === normalizeRaw(q.correctAnswer);

  setSelected(optionClicked.text);

  setAnswers((prev) => {
    const next = [...prev];
    next[current] = {
      question: q.question,
      selected: optionClicked.text,
      correctAnswer: q.correctAnswer,
      isCorrect,
      timeTaken: timeTakenMs, // ✅ milli-seconds
    };
    return next;
  });

  setFeedback(
    isCorrect
      ? subjectLower === "urdu"
        ? "✅ درست جواب!"
        : "✅ Correct!"
      : subjectLower === "urdu"
      ? "❌ غلط جواب"
      : "❌ Wrong!"
  );

  Speech.speak(
    isCorrect
      ? subjectLower === "urdu"
        ? "صحیح جواب، بہت خوب!"
        : "Correct answer, well done!"
      : subjectLower === "urdu"
      ? "غلط جواب"
      : "Wrong answer",
    { language: subjectLower === "urdu" ? "ur" : "en" }
  );

  setTimeout(() => {
    setFeedback(null);
    setSelected(null);

    if (current + 1 < cleanQuiz.length) {
      setQuestionStart(Date.now()); // ✅ reset timer
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
      setFeedback(
        subjectLower === "urdu" ? "🎉 کوئز مکمل!" : "🎉 Quiz Finished!"
      );

      // ✅ include last answer using local variable
      const finalAnswers = [...answers];
      finalAnswers[current] = {
        question: q.question,
        selected: optionClicked.text,
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeTaken: timeTakenMs, // ✅ milli-seconds
      };

      const finalScore = finalAnswers.filter((a) => a.isCorrect).length;
      saveResults(finalAnswers, finalScore);

      Speech.speak(
        subjectLower === "urdu"
          ? "مبارک ہو، آپ نے کوئز مکمل کر لیا!"
          : "Congratulations, you finished the quiz!",
        { language: subjectLower === "urdu" ? "ur" : "en" }
      );
    }
  }, 900);
};



  if (!cleanQuiz || !cleanQuiz.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>No quiz available</Text>
      </View>
    );
  }

  const question = cleanQuiz[current];

  return (
    <View style={styles.container}>
      <Text style={styles.subject}>
        {subject} Quiz ({current + 1}/{cleanQuiz.length})
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      {question.imageUrl && (
        <Image
          source={{ uri: question.imageUrl }}
          style={styles.questionImage}
          resizeMode="contain"
        />
      )}

      <FlatList
        data={question.options}
        keyExtractor={(item, idx) => idx.toString()}
        numColumns={2}
        renderItem={({ item, index }) => {
          const isChosen = selected === item.text;
          const isRight =
            normalize(item.text) === normalize(question.correctAnswer) ||
            normalizeRaw(item.text) === normalizeRaw(question.correctAnswer);

          let bg = boxColors[index % boxColors.length];
          if (isChosen) bg = isRight ? GREEN : RED;

          return (
            <TouchableOpacity
              onPress={() => handleAnswer(item)}
              style={[styles.optionBox, { backgroundColor: bg }]}
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.optionImage}
                  resizeMode="contain"
                />
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
            {subjectLower === "urdu" ? "آپ کا اسکور" : "Your score"}: {score}/
            {cleanQuiz.length}
          </Text>

          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => {
              setCurrent(0);
              setFinished(false);
              setFeedback(null);
              setSelected(null);
              setAnswers(Array(cleanQuiz.length).fill(null));
              setQuestionStart(Date.now());
            }}
          >
            <Text style={styles.restartText}>
              {subjectLower === "urdu"
                ? "🔄 دوبارہ شروع کریں"
                : "🔄 Restart Quiz"}
            </Text>
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
  subject: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: RED,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: TEXT,
  },
  questionImage: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
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
  optionText: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "700",
    textAlign: "center",
  },
  feedback: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: RED,
  },
  restartBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    alignSelf: "center",
  },
  restartText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
