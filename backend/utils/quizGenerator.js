const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(" Missing Gemini API key. Set GEMINI_API_KEY in your .env file.");
}

const UrduAlphabet = require('../models/Urdu');
const Alphabet = require('../models/Alphabet'); // English
const NumberModel = require('../models/Number'); // Maths

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.9,
    topP: 0.9,
    topK: 40
  }
});

/**
 *  Dynamic prompt builder
 * @param {string} subject - "urdu", "english", "math"
 * @param {string[]} allowedItems - allowed letters/numbers/words
 */
function buildPromptFor(subject, allowedItems = []) {
  const baseInstruction = `
You are an assistant that MUST return only a JSON array (no extra text) containing 10 multiple-choice questions suitable for preschool kids (age 4-5).
Return EXACTLY an array of objects. Each object must have:
- "question": short simple text-only question
- "options": an array of 4 short option strings (order randomized)
- "correctAnswer": the exact option text (must match one option exactly)
- "imageUrl": optional string (null if text-only)

Important:
- The JSON must be valid and contain no markdown or comments.
`;

  const variation = `Create a fresh and different set of questions. Random seed: ${Math.random()}.`;

  const allowedList = allowedItems && allowedItems.length > 0
    ? `Use ONLY the following values when forming questions or options: ${allowedItems.join(", ")}.`
    : "Use your default set of letters/numbers.";

  if (/^urdu$/i.test(subject)) {
    return `${baseInstruction}
Language: Urdu (use actual Urdu script, not Roman Urdu).
Restrict strictly to letters from ا to ی only.
${allowedList}
Make questions about:
- Identifying letters ("یہ کون سا حرف ہے؟") → MUST have imageUrl showing the letter.
- Sequence before/after ("ب کے بعد کون سا حرف آتا ہے؟")
- Missing letters ("الف اور ت کے درمیان کون سا حرف آتا ہے؟")
${variation}`;
  } else if (/^english$/i.test(subject)) {
    return `${baseInstruction}
Language: English.
Restrict strictly to CAPITAL letters A to Z only.
${allowedList}
Make questions about:
- Identifying letters ("Which letter is this?") → MUST have imageUrl showing the letter.
- Sequence after ("What comes after C?")
- Sequence before ("What comes before C?")
- Missing letters ("Which letter comes between A and C?)
- Picture-based: e.g. show an image of "CAT" and ask "Which letter does this word start with?"
${variation}`;
  } else if (/^(math|maths)$/i.test(subject)) {
    return `${baseInstruction}
Language: English (numbers are universal).
Restrict strictly to numbers 1 through 10 only.
${allowedList}
Make questions about:
- Identifying numbers 1-10 → MUST have imageUrl if asking "Which number is this?")
- Before in sequence ("What comes before 7?")
- After in sequence ("What comes after 7?")
- Fill in missing number ("What number comes between 1 and 2")
- Include questions like ("How many objects are there")
- Don't include any object or things name like star,apples instead use words like objects,items
${variation}`;
  } else {
    return `${baseInstruction}Subject: ${subject}. ${allowedList} ${variation}`;
  }
}

function normalize(str) {
  return str ? str.toString().trim().normalize("NFC").replace(/\s+/g, "") : "";
}

/**
 * Attach local image URLs to each option
 */
async function attachOptionImages(quiz, subject) {
  let dataset = [];

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
      return { text: opt, imageUrl: lookup[key] || null };
    });
    return q;
  });
}

/**
 * Generate quiz from Gemini restricted to provided items
 * @param {string} subject - urdu | english | math
 * @param {string[]} allowedItems - list of allowed letters or numbers
 */
async function generateQuiz(subject, allowedItems = []) {
  const prompt = buildPromptFor(subject, allowedItems);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
console.log("********************************************************************************");
console.log(text);
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No valid JSON found in AI response");

    let quiz = JSON.parse(match[0]);

    // Attach images
    quiz = await attachOptionImages(quiz, subject);

    // Ensure imageUrl of correct answer is used if available
    quiz = quiz.map(q => {
      const correctOpt = q.options.find(opt => opt.text === q.correctAnswer);
      q.imageUrl = correctOpt?.imageUrl || q.imageUrl || null;
      return q;
    });

    
    return quiz;
  } catch (error) {
    console.error(" Quiz generation error:", error);
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
