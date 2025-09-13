// QuizScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import * as Speech from "expo-speech";

/* ---------- Theme ---------- */
const TEXT = "#000000";
const RED = "#EF3349";
const boxColors = ["#FFC1CC", "#7BE7CE", "#FFD54F", "#FFB6C1"];

/* ---------- Urdu letters (common set) ---------- */
const URDU_LETTERS = [
  "ا","ب","پ","ت","ٹ","ث","ج","چ","ح","خ","د","ڈ","ذ","ر","ڑ","ز","ژ",
  "س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ک","گ","ل","م","ن","و","ہ","ء","ی","ے"
];

/* ---------- Helpers ---------- */
const normalize = (t) => {
  if (t === null || t === undefined) return "";
  try {
    // Unicode normalize + collapse spaces + trim + lowercase for comparisons
    return String(t).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
  } catch (e) {
    return String(t).replace(/\s+/g, " ").trim().toLowerCase();
  }
};

const normalizeRaw = (t) => {
  // keep case, but normalize unicode + trim + collapse spaces
  if (t === null || t === undefined) return "";
  try {
    return String(t).normalize("NFC").replace(/\s+/g, " ").trim();
  } catch (e) {
    return String(t).replace(/\s+/g, " ").trim();
  }
};

const isArabicScript = (text) => {
  if (!text) return false;
  // check presence of characters in Arabic/Urdu block (basic heuristic)
  // allow spaces and punctuation too
  return /^[\u0600-\u06FF\s\p{P}\p{M}]+$/u.test(String(text));
};

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandomUrduLetter = () => URDU_LETTERS[Math.floor(Math.random() * URDU_LETTERS.length)];

/* ---------- Sanitize / Validate Urdu quiz items ---------- */
const makeUrduLetterQuestion = (letter) => {
  // question shows the letter in text (no images)
  const qText = `نیچے دیا گیا حرف کون سا ہے؟ '${letter}'`;
  const optionsSet = new Set([letter]);
  while (optionsSet.size < 4) {
    optionsSet.add(pickRandomUrduLetter());
  }
  const options = shuffle(Array.from(optionsSet));
  return { question: qText, options, correctAnswer: letter };
};

const resolveCorrectAnswer = (correctRaw, options = []) => {
  if (!correctRaw) return "";
  const raw = normalizeRaw(correctRaw);

  // 1) Single Urdu letter exact
  if (raw.length === 1 && URDU_LETTERS.includes(raw)) {
    // find matching option
    for (let opt of options) if (normalize(opt) === normalize(raw)) return opt;
    // if not present, return raw (caller will handle fallback)
    return raw;
  }

  // 2) Direct match against options (normalized)
  for (let opt of options) {
    if (normalize(opt) === normalize(raw)) return opt;
  }

  // 3) Strip common prefixes (like "جواب:" or "Answer:" or "a) ")
  const stripped = raw.replace(/^(جواب[:\s-]+|answer[:\s-]+|[a-d]\)\s*)/i, "").trim();
  for (let opt of options) {
    if (normalize(opt) === normalize(stripped)) return opt;
  }

  // 4) fallback -> return raw
  return raw;
};

const sanitizeUrduQuiz = (quiz) => {
  if (!Array.isArray(quiz)) return [];

  const cleaned = quiz.map((item) => {
    try {
      const qText = normalizeRaw(item.question || "");
      const options = Array.isArray(item.options)
        ? item.options.map((o) => normalizeRaw(o)).filter(Boolean)
        : [];
      const rawCorrect = item.correctAnswer || item.answer || "";

      // If question or options clearly not Urdu, reject and replace
      const optionsAreUrdu = options.length >= 1 && options.every((o) => isArabicScript(o));
      const questionIsUrdu = qText ? isArabicScript(qText) : false;

      // Try to resolve correct to one of options
      const resolved = resolveCorrectAnswer(rawCorrect, options);

      // If resolved matches an option (normalized), keep item
      const matchedOpt = options.find((opt) => normalize(opt) === normalize(resolved));

      if (questionIsUrdu && options.length === 4 && matchedOpt) {
        return {
          question: qText,
          options,
          correctAnswer: matchedOpt,
        };
      }

      // If options are not 4 but question looks like "A _ C" in Urdu? (rare) -> fallback
      // Fallback: create a programmatic Urdu-letter question
      const fallbackLetter = URDU_LETTERS[Math.floor(Math.random() * URDU_LETTERS.length)];
      return makeUrduLetterQuestion(fallbackLetter);
    } catch (e) {
      // on any error, return a safe fallback question
      return makeUrduLetterQuestion(pickRandomUrduLetter());
    }
  });

  // ensure we have at least 1 valid question
  return cleaned.length ? cleaned : [makeUrduLetterQuestion(pickRandomUrduLetter())];
};

/* ---------- Main Component ---------- */
export default function QuizScreen({ route }) {
  const { subject, quizText } = route?.params || {
    subject: "Urdu",
    quizText: [
      // demo fallback (Urdu)
      makeUrduLetterQuestion("ا"),
      makeUrduLetterQuestion("ب"),
      makeUrduLetterQuestion("پ"),
    ],
  };

  const subjectLower = (subject || "").toString().toLowerCase();

  // sanitize only if Urdu subject
  const cleanQuiz = useMemo(() => {
    if (subjectLower === "urdu") return sanitizeUrduQuiz(quizText);
    // for non-Urdu just normalize & ensure structure
    if (!Array.isArray(quizText)) return [];
    return quizText.map((q) => ({
      question: normalizeRaw(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(normalizeRaw).slice(0, 4) : [],
      correctAnswer: normalizeRaw(q.correctAnswer || q.answer || ""),
    }));
  }, [quizText, subjectLower]);

  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (cleanQuiz?.length > 0 && cleanQuiz[current]) {
      const qtext = cleanQuiz[current].question || "";
      // choose language for speech
      const lang = subjectLower === "urdu" ? "ur" : "en";
      Speech.speak(qtext, { language: lang });
    }
  }, [current, cleanQuiz, subjectLower]);

  const handleAnswer = (optionClicked) => {
    const q = cleanQuiz[current];
    const resolvedCorrect = resolveCorrectAnswer(q.correctAnswer || "", q.options || []);

    // Debugging - uncomment if you need logs in console
    // console.log("Clicked:", optionClicked, " | ResolvedCorrect:", resolvedCorrect, " | Options:", q.options);

    if (normalize(optionClicked) === normalize(resolvedCorrect)) {
      // correct
      const msg = subjectLower === "urdu" ? "صحیح جواب، بہت خوب!" : "Correct answer, well done!";
      setFeedback(subjectLower === "urdu" ? "✅ درست جواب!" : "✅ Correct!");
      Speech.speak(msg, { language: subjectLower === "urdu" ? "ur" : "en" });

      setTimeout(() => {
        setFeedback(null);
        if (current + 1 < cleanQuiz.length) {
          setCurrent(current + 1);
        } else {
          const finishMsg = subjectLower === "urdu" ? "مبارک ہو، آپ نے کوئز مکمل کر لیا!" : "Congratulations, you finished the quiz!";
          setFeedback(subjectLower === "urdu" ? "🎉 کوئز مکمل!" : "🎉 Quiz Finished!");
          Speech.speak(finishMsg, { language: subjectLower === "urdu" ? "ur" : "en" });
        }
      }, 1000);
    } else {
      // wrong
      const wrongMsg = subjectLower === "urdu" ? "غلط جواب، دوبارہ کوشش کریں" : "Wrong answer, try again";
      setFeedback(subjectLower === "urdu" ? "❌ دوبارہ کوشش کریں" : "❌ Try Again!");
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
            <Text style={styles.optionText}>{item}</Text>
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
    marginBottom: 20,
    textAlign: "center",
    color: TEXT,
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
  },
  optionText: {
    fontSize: 20,
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
