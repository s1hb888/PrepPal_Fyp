const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ Missing Gemini API key. Set GEMINI_API_KEY in your .env file.");
}

const UrduAlphabet = require('../models/Urdu');
const Alphabet = require('../models/Alphabet'); // English
const NumberModel = require('../models/Number'); // Maths

// ✅ Use supported Gemini model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",   // 🔥 Updated model name
  generationConfig: {
    temperature: 0.9, // random variation
    topP: 0.9,
    topK: 40
  }
});

/**
 * Build subject-specific prompt for quiz generation
 */
function buildPromptFor(subject) {
  const baseInstruction = `
You are an assistant that MUST return only a JSON array (no extra text) containing 10 multiple-choice questions suitable for preschool kids (age 4-5).
Return EXACTLY an array of objects. Each object must have:
- "question": short simple text-only question
- "options": an array of 4 short option strings (order randomized)
- "correctAnswer": the exact option text. It must be IDENTICAL to one of the strings in "options".
- "imageUrl": optional string. 
   * If the question is about identifying a letter ("Which letter is this?" / "یہ کون سا حرف ہے؟"), include an imageUrl showing that letter.
   * For other picture-based questions, also include a valid imageUrl.
   * If the question is purely text-based, you may set imageUrl as null.

Important:
- "options" must always be text (not images).
- Output must be valid JSON only.
`;

  // 👉 Random seed so har run par naye sawal ayen
  const variation = `Create a fresh and different set of questions than before. 
  Do NOT repeat previous patterns. Random seed: ${Math.random()}`;

  if (/^urdu$/i.test(subject)) {
    return baseInstruction + variation + `
Language: Urdu (use actual Urdu script, not Roman Urdu).
Restrict strictly to letters from ا to ی only.
Make questions about:
- Identifying letters ("یہ کون سا حرف ہے؟") → MUST have imageUrl showing the letter.
- Sequence before/after ("ب کے بعد کون آتا ہے؟")
- Missing letters ("ا _ ت")
`;
  } else if (/^english$/i.test(subject)) {
    return baseInstruction + variation + `
Language: English.
Restrict strictly to CAPITAL letters A to Z only.
Make questions about:
- Identifying letters ("Which letter is this?") → MUST have imageUrl showing the letter.
- Sequence before/after ("What comes after C?")
- Missing letters ("A _ C")
- Picture-based: e.g. show an image of "CAT" and ask "Which letter does this word start with?" (include imageUrl)
`;
  } else if (/^(math|maths)$/i.test(subject)) {
    return baseInstruction + variation + `
Language: English (numbers are universal).
Restrict strictly to numbers 1 through 10 only.
Make questions about:
- Identifying numbers 1-10 → MUST have imageUrl if asking "Which number is this?")
- Before/after in sequence ("What comes before 7?")
- Fill in missing number ("1, 2, _ , 4")
- Comparing small numbers ("Which is bigger: 3 or 5?")
- Picture-based: e.g. show 3 apples and ask "How many apples are there?" (include imageUrl)
`;
  } else {
    return baseInstruction + variation + `Language: English. Subject: ${subject}.`;
  }
}

function normalize(str) {
  return str
    ? str.toString().trim().normalize("NFC").replace(/\s+/g, "")
    : "";
}

async function attachOptionImages(quiz, subject) {
  let dataset = [];
  console.log("🔍 Subject:", subject);

  if (/^urdu$/i.test(subject)) {
    dataset = await UrduAlphabet.find({}).lean();
  } else if (/^english$/i.test(subject)) {
    dataset = await Alphabet.find({}).lean();
  } else if (/^maths?$/i.test(subject)) {
    dataset = await NumberModel.find({}).lean();
  }

  const lookup = {};

  dataset.forEach(item => {
    if (/^urdu$/i.test(subject)) {
      // Multiple forms split (e.g. "ی، ے")
      const chars = item.alphabet.split(/،|,|\s+/).map(normalize);
      chars.forEach(ch => {
        if (ch) lookup[ch] = item.image_url;
      });
    } else if (/^english$/i.test(subject)) {
      lookup[normalize(item.alphabet).toUpperCase()] = item.image_url;
    } else if (/^maths?$/i.test(subject)) {
      lookup[normalize(String(item.number))] = item.image_url;
      lookup[normalize(item.word)] = item.image_url;
    }
  });

  return quiz.map(q => {
    q.options = q.options.map(opt => {
      const key = normalize(opt);
      return {
        text: opt,
        imageUrl: lookup[key] || null,
      };
    });
    return q;
  });
}

async function generateQuiz(subject) {
  const prompt = buildPromptFor(subject);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean unwanted wrappers
    text = text.replace(/```json|```/g, "").trim();

    // Extract JSON
    const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No valid JSON found in AI response");

    let quiz = JSON.parse(match[0]);

    // ✅ Attach images from DB for each option
    quiz = await attachOptionImages(quiz, subject);

    // ✅ Ensure question imageUrl matches correct option if available
    quiz = quiz.map(q => {
      const correctOpt = q.options.find(opt => opt.text === q.correctAnswer);

      if (correctOpt && correctOpt.imageUrl) {
        q.imageUrl = correctOpt.imageUrl;
      } else {
        q.imageUrl = q.imageUrl || null;
      }

      return q;
    });

    console.log("✅ Final Quiz:", JSON.stringify(quiz, null, 2));
    return quiz;
  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    throw error;
  }
}

/**
 * Safe answer comparison helper
 */
function checkAnswer(selected, correct) {
  if (!selected || !correct) return false;
  return selected.trim().toLowerCase() === correct.trim().toLowerCase();
}

module.exports = { generateQuiz, checkAnswer };
