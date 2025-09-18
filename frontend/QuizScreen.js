// QuizScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import * as Speech from "expo-speech";

/* ---------- Theme ---------- */
const TEXT = "#000000";
const RED = "#EF3349";
const boxColors = ["#FFC1CC", "#7BE7CE", "#FFD54F", "#FFB6C1"];

/* ---------- Helpers ---------- */
const normalize = (t) => {
  if (!t) return "";
  return String(t).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
};
const normalizeRaw = (t) => {
  if (!t) return "";
  return String(t).normalize("NFC").replace(/\s+/g, " ").trim();
};

/* ---------- Main Component ---------- */
export default function QuizScreen({ route }) {
  const { subject, quizText } = route?.params || {
    subject: "General",
    quizText: [
      {
        question: "WHICH LETTER IS THIS?",
        options: [
          {
            text: "A",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/demo/o/A.png",
          },
          {
            text: "B",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/demo/o/B.png",
          },
          {
            text: "C",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/demo/o/C.png",
          },
          {
            text: "D",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/demo/o/D.png",
          },
        ],
        correctAnswer: "C",
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/demo/o/C.png",
      },
    ],
  };

  const subjectLower = (subject || "").toString().toLowerCase();

 // ✅ Clean + include imageUrl from question/options
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
      imageUrl: q.imageUrl || null, // ✅ agar question ke sath diya ho toh
    };
  });
}, [quizText]);


  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (cleanQuiz?.length > 0 && cleanQuiz[current]) {
      const qtext = cleanQuiz[current].question || "";
      const lang = subjectLower === "urdu" ? "ur" : "en";
      Speech.speak(qtext, { language: lang });
    }
  }, [current, cleanQuiz, subjectLower]);

  const handleAnswer = (optionClicked) => {
    const q = cleanQuiz[current];
    if (normalize(optionClicked.text) === normalize(q.correctAnswer)) {
      // ✅ correct
      const msg =
        subjectLower === "urdu"
          ? "صحیح جواب، بہت خوب!"
          : "Correct answer, well done!";
      setFeedback(subjectLower === "urdu" ? "✅ درست جواب!" : "✅ Correct!");
      Speech.speak(msg, { language: subjectLower === "urdu" ? "ur" : "en" });

      setTimeout(() => {
        setFeedback(null);
        if (current + 1 < cleanQuiz.length) {
          setCurrent(current + 1);
        } else {
          const finishMsg =
            subjectLower === "urdu"
              ? "مبارک ہو، آپ نے کوئز مکمل کر لیا!"
              : "Congratulations, you finished the quiz!";
          setFeedback(
            subjectLower === "urdu" ? "🎉 کوئز مکمل!" : "🎉 Quiz Finished!"
          );
          Speech.speak(finishMsg, { language: subjectLower === "urdu" ? "ur" : "en" });
        }
      }, 1000);
    } else {
      // ❌ wrong
      const wrongMsg =
        subjectLower === "urdu"
          ? "غلط جواب، دوبارہ کوشش کریں"
          : "Wrong answer, try again";
      setFeedback(
        subjectLower === "urdu" ? "❌ دوبارہ کوشش کریں" : "❌ Try Again!"
      );
      Speech.speak(wrongMsg, { language: subjectLower === "urdu" ? "ur" : "en" });
    }
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
      <Text style={styles.subject}>{subject} Quiz</Text>
      <Text style={styles.question}>{question.question}</Text>

      {/* Question image (agar ho) */}
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
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleAnswer(item)}
            style={[
              styles.optionBox,
              { backgroundColor: boxColors[index % boxColors.length] },
            ]}
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
        )}
        contentContainerStyle={styles.optionsContainer}
      />

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF8F8" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 18, color: TEXT },

  subject: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: RED,
  },

  question: {
    fontSize: 22,
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

  optionsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
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
  optionImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "700",
    textAlign: "center",
  },

  feedback: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: RED,
  },
});
