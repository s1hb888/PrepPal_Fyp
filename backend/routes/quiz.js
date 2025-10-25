// routes/quiz.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const NumberModel = require('../models/Number');
const UrduModel = require('../models/Urdu');
const AlphabetModel = require('../models/Alphabet');
const Performance = require('../models/Performance');
const verifyToken = require('../middleware/authMiddleware');
const { generateQuiz } = require('../utils/quizGenerator');

// Optional Result model — used only if your app saves results separately
let ResultModel = null;
try {
  ResultModel = require('../models/Result');
} catch (e) {
  ResultModel = null;
  console.log('ℹ️ Result model not found, skipping Result-to-Quiz sync fallback.');
}

// Map subject → model and field
const subjectModels = {
  Number: NumberModel,
  Urdu: UrduModel,
  Alphabet: AlphabetModel,
};
const subjectFields = {
  Number: 'number',
  Urdu: 'alphabet',
  Alphabet: 'alphabet',
};

/* ---------------- GENERATE endpoint ----------------
   - NOTE: generate no longer writes performance.
*/
router.post('/generate', verifyToken, async (req, res) => {
  const { subject } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!subject) return res.status(400).json({ message: 'Subject is required.' });

  const Model = subjectModels[subject];
  const field = subjectFields[subject];
  if (!Model || !field) return res.status(400).json({ message: `Invalid subject: ${subject}` });

  try {
    // 1️⃣ Fetch user's performance for this subject
    const perfRecords = await Performance.find({ userId, subject });
    let itemsToUse = [];

    if (!perfRecords || perfRecords.length === 0) {
      // First-time user → pick all items
      const allDocs = await Model.find({}, { [field]: 1 });
      itemsToUse = allDocs.map(d => d[field]);
      console.log(`ℹ️ First-time user: picking all ${subject} items`, itemsToUse);
    } else {
      // Existing user → pick only items with done=false
      itemsToUse = perfRecords.filter(r => !r.done).map(r => r.item);
      console.log(`ℹ️ Existing user: picking ${subject} items with done=false`, itemsToUse);
    }

    // 2️⃣ If no items to pick → all items mastered
    if (itemsToUse.length === 0) {
      return res.status(200).json({
        message: `✅ All ${subject} items are already mastered 🎯`,
        quiz: [],
      });
    }

    // 3️⃣ Generate quiz via AI
    const aiSubject = subject === 'Number' ? 'math' : subject === 'Alphabet' ? 'english' : 'urdu';
    console.log(`🧠 Generating quiz for user=${userId}, subject=${subject}, items:`, itemsToUse);

    const quizQuestions = await generateQuiz(aiSubject, itemsToUse);
    if (!quizQuestions || quizQuestions.length === 0) {
      return res.status(500).json({ message: 'AI quiz generation failed.' });
    }

    // 4️⃣ Save new quiz
    const newQuiz = await Quiz.create({
      userId,
      subject,
      questions: quizQuestions,
      totalQuestions: quizQuestions.length,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: `🎓 ${subject} quiz generated for ${itemsToUse.length} item(s)`,
      quizId: newQuiz._id,
      totalQuestions: quizQuestions.length,
      quiz: quizQuestions,
    });
  } catch (err) {
    console.error('❌ Quiz generation error:', err);
    res.status(500).json({ message: 'Failed to generate quiz.' });
  }
});


/* ---------------- COMPLETE endpoint ----------------
   - If provided { quizId, answers }, updates that quiz first.
   - Then recalculates performance for ALL subjects for this user from quizzes (or ResultModel fallback).
   - Saves a fresh set of Performance docs for this user (deleteMany + insertMany).
   - For every item in model we insert a record even if attempts=0.
   - Adds `done` flag per item's per-model mastery config.
*/
router.post('/complete', verifyToken, async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const { quizId, answers } = req.body || {};

  try {
    console.log(`🔁 /complete called for user=${userId} (quizId=${quizId || 'none'})`);

    // 1) If quizId + answers are provided, update that quiz first
    if (quizId && Array.isArray(answers)) {
      const quiz = await Quiz.findOne({ _id: quizId, userId });
      if (!quiz) return res.status(404).json({ message: 'Quiz not found for updating.' });

      quiz.questions = quiz.questions.map((q, idx) => {
        const userAns = answers.find((a) => {
          if (!a) return false;
          if (a.questionId) return a.questionId.toString() === (q._id ? q._id.toString() : '') || a.questionId === String(idx);
          return a.index === idx;
        });
        if (userAns) {
          q.userAnswer = userAns.answer;
          q.isCorrect = String(userAns.answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
          q.timeTaken = userAns.timeTaken || 0; // stored in ms
        }
        return q;
      });

      await quiz.save();
      console.log(`✅ Quiz ${quizId} updated with provided answers.`);
    }

    // 2) Fetch all quizzes for this user
    let allQuizzes = await Quiz.find({ userId });
    if (!allQuizzes || allQuizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found for this user.' });
    }

    // 3) If no answered questions exist inside quizzes, try ResultModel fallback
    let anyAnswered = allQuizzes.some(qz => qz.questions.some(q => q.userAnswer !== undefined || q.isCorrect !== undefined));

    if (!anyAnswered && ResultModel) {
      console.log('ℹ️ No answers in quizzes. Trying to apply from Result collection...');
      const results = await ResultModel.find({ userId }).lean().limit(500);
      if (results && results.length) {
        let applied = 0;
        for (const r of results) {
          if (!r.quizId || !Array.isArray(r.answers)) continue;
          const quizToUpdate = await Quiz.findOne({ _id: r.quizId, userId });
          if (!quizToUpdate) continue;
          quizToUpdate.questions = quizToUpdate.questions.map((q, idx) => {
            const a = r.answers.find(ans => {
              if (!ans) return false;
              if (ans.questionId) return ans.questionId.toString() === (q._id ? q._id.toString() : '') || ans.questionId === String(idx);
              return ans.index === idx;
            });
            if (a) {
              q.userAnswer = a.answer;
              q.isCorrect = String(a.answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
              q.timeTaken = a.timeTaken || 0;
            }
            return q;
          });
          await quizToUpdate.save();
          applied++;
        }
        console.log(`🔁 Applied answers from Result collection to ${applied} quizzes.`);
        // refresh allQuizzes
        allQuizzes = await Quiz.find({ userId });
        anyAnswered = allQuizzes.some(qz => qz.questions.some(q => q.userAnswer !== undefined || q.isCorrect !== undefined));
      }
    }

    if (!anyAnswered) {
      return res.status(400).json({
        message: 'No answered questions found in quizzes. Provide answers or ensure results exist to compute performance.'
      });
    }

    // 4) Group quizzes by subject
    const subjectsMap = {};
    for (const qz of allQuizzes) {
      if (!qz.subject) continue;
      if (!subjectsMap[qz.subject]) subjectsMap[qz.subject] = [];
      subjectsMap[qz.subject].push(qz);
    }

    // 5) Rebuild full performance for this user (include unattempted items)
    const allPerformance = [];

    for (const [subject, quizzes] of Object.entries(subjectsMap)) {
      // choose model and field for this subject
      const Model = subjectModels[subject];
      const field = subjectFields[subject];
      if (!Model || !field) {
        console.warn(`⚠️ Unknown subject model for "${subject}", skipping.`);
        continue;
      }

      // fetch all items from model (to include items with zero attempts)
      const allDocs = await Model.find({}, { [field]: 1, min_attempts: 1, min_correct_avg: 1, min_time_avg: 1 });
      // aggregate attempted stats from quizzes for this subject
      const perfMap = {};
      for (const qz of quizzes) {
        for (const q of qz.questions) {
          // consider only answered questions (userAnswer/isCorrect present)
          if (q.userAnswer === undefined && q.isCorrect === undefined) continue;
          const key = q.correctAnswer;
          if (!perfMap[key]) perfMap[key] = { attempts: 0, correct: 0, timeMs: 0 };
          perfMap[key].attempts++;
          if (q.isCorrect) perfMap[key].correct++;
          perfMap[key].timeMs += q.timeTaken || 0;
        }
      }

      // for every model item, compute stats (attempts may be zero)
      for (const doc of allDocs) {
        const key = doc[field];
        const stats = perfMap[key] || { attempts: 0, correct: 0, timeMs: 0 };
        const attempts = stats.attempts;
        const correct = stats.correct;
        const avgTimeSec = attempts ? stats.timeMs / attempts / 1000 : 0;
        const accuracy = attempts ? (correct / attempts) * 100 : 0;

        const meetsCriteria =
          attempts >= (doc.min_attempts || 0) &&
          accuracy >= (doc.min_correct_avg || 0) &&
          avgTimeSec <= (doc.min_time_avg || Infinity);

        allPerformance.push({
          userId,
          subject,
          item: key,
          attempts,
          correct,
          accuracy: +accuracy.toFixed(2),
          avgTimeSec: +avgTimeSec.toFixed(2),
          lastUpdated: new Date(),
          done: Boolean(meetsCriteria),
        });
      }

      console.log(`📘 ${subject}: processed ${allDocs.length} items (attempted+unattempted).`);
    }

    // 6) Replace old performance for this user with freshly computed ones
    await Performance.deleteMany({ userId });
    if (allPerformance.length > 0) {
      await Performance.insertMany(allPerformance);
      console.log(`💾 Inserted ${allPerformance.length} performance records for user=${userId}`);
    } else {
      console.log('⚠️ No performance records to insert (unexpected).');
    }

    return res.status(200).json({
      message: '✅ Performance refreshed for all items with done flag.',
      subjectsProcessed: Object.keys(subjectsMap).length,
      recordsInserted: allPerformance.length
    });
  } catch (err) {
    console.error('❌ Performance refresh error:', err);
    return res.status(500).json({ message: 'Failed to refresh performance.', error: err.message });
  }
});

module.exports = router;
