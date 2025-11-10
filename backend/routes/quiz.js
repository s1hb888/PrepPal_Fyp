// routes/quiz.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const NumberModel = require('../models/Number');
const UserAccess = require('../models/UserAccess');
const UrduModel = require('../models/Urdu');
const AlphabetModel = require('../models/Alphabet');
const Performance = require('../models/Performance');
const verifyToken = require('../middleware/authMiddleware');
const { generateQuiz } = require('../utils/quizGenerator');

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

/* ---------------- GENERATE endpoint ----------------*/
router.post('/generate', verifyToken, async (req, res) => {
  const { subject } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!subject) return res.status(400).json({ message: 'Subject is required.' });

  const Model = subjectModels[subject];
  const field = subjectFields[subject];
  if (!Model || !field) return res.status(400).json({ message: `Invalid subject: ${subject}` });

  try {
    // 🗺️ Map subject → access key
    const accessKeyMap = {
      Alphabet: 'alphabets',
      Urdu: 'urdu_alphabets',
      Number: 'numbers'
    };
    const accessKey = accessKeyMap[subject] || subject.toLowerCase();

    // 1️⃣ Load user access and performance
    const mongoose = require('mongoose');
    const [userAccess, perfRecords] = await Promise.all([
      UserAccess.findOne({ user_id: new mongoose.Types.ObjectId(userId) }).lean(),
      Performance.find({ userId, subject })
    ]);

    console.log(`🎯 Access for ${subject}:`, userAccess?._id ? 'Found ✅' : 'Not Found ❌');
    console.log(`📘 Performance records for ${subject}:`, perfRecords.length);

    let itemsToUse = [];

   if (!perfRecords || perfRecords.length === 0) {
  // 🧩 First-time user → pick only items that are active in user access
  const allDocs = await Model.find({}, { [field]: 1 });

  const activeAccessItems = userAccess?.access?.[accessKey]
    ?.filter(a => a.active)
    ?.map(a => a.item_id.toString()) || [];

  if (activeAccessItems.length > 0) {
    // ✅ Only include docs that match active item_ids
    itemsToUse = allDocs
      .filter(d => activeAccessItems.includes(d._id.toString()))
      .map(d => d[field]);
  } else {
    // 🚫 No active access → no items
    itemsToUse = [];
  }

  console.log(`🟢 First-time user: ${itemsToUse.length} active ${subject} items`);
}else {
      // 🧩 Existing user → only pick items with done=false
      const pendingItems = perfRecords.filter(r => !r.done).map(r => r.item);

      // Apply active filter from user access
      const activeAccessItems = userAccess?.access?.[accessKey]
        ?.filter(a => a.active)
        ?.map(a => a.item_id.toString()) || [];

      if (activeAccessItems.length > 0) {
        // Match item text against DB _id of active access items
        const activeDocs = await Model.find({ _id: { $in: activeAccessItems } }, { [field]: 1 });
        const activeItemTexts = activeDocs.map(d => d[field]);

        itemsToUse = pendingItems.filter(item => activeItemTexts.includes(item));
      } else {
        // No user access filtering available → fallback to done=false items
        itemsToUse = pendingItems;
      }

      console.log(`🟡 Existing user: ${itemsToUse.length} active pending ${subject} items`);
    }

    // 2️⃣ If no items to pick → all done
    if (itemsToUse.length === 0) {
      return res.status(200).json({
        message: `✅ All ${subject} items are already mastered or inactive 🎯`,
        quiz: [],
      });
    }

    // 3️⃣ Generate quiz via AI
    const aiSubject =
      subject === 'Number'
        ? 'math'
        : subject === 'Alphabet'
        ? 'english'
        : 'urdu';

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

router.post('/complete', verifyToken, async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const { quizId, answers } = req.body || {};

  try {
    console.log(` /complete called for user=${userId} (quizId=${quizId || 'none'})`);

    //  Update quiz if answers provided
   
    // 2️⃣ Fetch all quizzes
    let allQuizzes = await Quiz.find({ userId });
    if (!allQuizzes?.length)
      return res.status(404).json({ message: 'No quizzes found for this user.' });

    // 3️⃣ Ensure answers exist
    let anyAnswered = allQuizzes.some((qz) =>
      qz.questions.some((q) => q.userAnswer !== undefined || q.isCorrect !== undefined)
    );

    if (!anyAnswered) {
      return res.status(400).json({
        message:
          'No answered questions found in quizzes. Provide answers or ensure results exist to compute performance.',
      });
    }

    // 4️⃣ Group quizzes by subject
    const subjectsMap = {};
    for (const qz of allQuizzes) {
      if (!qz.subject) continue;
      if (!subjectsMap[qz.subject]) subjectsMap[qz.subject] = [];
      subjectsMap[qz.subject].push(qz);
    }

    // 5️⃣ Fetch user access config
    const mongoose = require('mongoose');
    const userAccess = await UserAccess.findOne({
      user_id: new mongoose.Types.ObjectId(userId),
    }).lean();

    console.log('🎯 Loaded userAccess:', userAccess?._id ? 'Found ✅' : 'Not Found ❌', userAccess);
const allPerformance = [];

// 🗺️ Map subject → access key
const accessKeyMap = {
  Alphabet: 'alphabets',
  Urdu: 'urdu_alphabets',
  Number: 'numbers'
};

//  Subject-wise performance
for (const [subject, quizzes] of Object.entries(subjectsMap)) {
  const Model = subjectModels[subject];
  const field = subjectFields[subject];
  if (!Model || !field) {
    console.warn(` Unknown subject model for "${subject}", skipping.`);
    continue;
  }

  const allDocs = await Model.find();

  //  Aggregate user performance
  const perfMap = {};
  for (const qz of quizzes) {
    for (const q of qz.questions) {
      if (q.userAnswer === undefined && q.isCorrect === undefined) continue;
      const key = q.correctAnswer;
      if (!perfMap[key]) perfMap[key] = { attempts: 0, correct: 0, timeMs: 0 };
      perfMap[key].attempts++;
      if (q.isCorrect) perfMap[key].correct++;
      perfMap[key].timeMs += q.timeTaken || 0;
    }
  }

  // 🎯 Pick correct access list depending on subject
  const accessKey = accessKeyMap[subject] || subject.toLowerCase();
  const subjectAccessList = userAccess?.access?.[accessKey] || [];
  console.log(`📘 ${subject}: Found ${subjectAccessList.length} user access items.`);

  // 🧩 Compute performance for every doc
  for (const doc of allDocs) {
    const key = doc[field];
    const stats = perfMap[key] || { attempts: 0, correct: 0, timeMs: 0 };
    const attempts = stats.attempts;
    const correct = stats.correct;
    const avgTimeSec = attempts ? stats.timeMs / attempts / 1000 : 0;
    const accuracy = attempts ? (correct / attempts) * 100 : 0;

    // 🧩 User-specific criteria
    const userAccessItem = subjectAccessList.find(
      (a) => a.item_id?.toString() === doc._id.toString()
    );

    const minAttempts = userAccessItem?.min_attempts ?? doc.min_attempts;
    const minCorrect = userAccessItem?.min_correct_avg ?? doc.min_correct_avg;
    const minTime = userAccessItem?.min_time_avg ?? doc.min_time_avg;
    const isActive = userAccessItem?.active ?? true;

    const meetsCriteria =
      isActive && attempts >= minAttempts && accuracy >= minCorrect && avgTimeSec <= minTime;

    allPerformance.push({
      userId,
      subject,
      item: key,
      attempts,
      correct,
      accuracy: +accuracy.toFixed(2),
      avgTimeSec: +avgTimeSec.toFixed(2),
      done: Boolean(meetsCriteria),
      lastUpdated: new Date(),
      criteria: { minAttempts, minCorrect, minTime, isActive },
    });
  }

  console.log(`📗 ${subject}: Processed ${allDocs.length} items.`);
}


    // Replace performance
    await Performance.deleteMany({ userId });
    if (allPerformance.length > 0) {
      await Performance.insertMany(allPerformance);
      console.log(` Inserted ${allPerformance.length} performance records for user=${userId}`);
    } else {
      console.log(' No performance records to insert.');
    }

    res.status(200).json({
      message: ' Performance refreshed with user-level criteria.',
      subjectsProcessed: Object.keys(subjectsMap).length,
      recordsInserted: allPerformance.length,
    });
  } catch (err) {
    console.error(' Performance refresh error:', err);
    res.status(500).json({
      message: 'Failed to refresh performance.',
      error: err.message,
    });
  }
});


module.exports = router;
