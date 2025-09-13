import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing Gemini API key. Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Build subject-specific prompt for quiz generation
 */
function buildPromptFor(subject) {
  const baseInstruction = `
You are an assistant that MUST return only a JSON array (no extra text) containing 10 multiple-choice questions suitable for preschool kids (age 4-5).
Return EXACTLY an array of objects. Each object must have:
- "question": short simple text-only question
- "options": an array of 4 short option strings (order randomized)
- "correctAnswer": the exact option text. It must be IDENTICAL to one of the strings in "options" (character-for-character, no extra words).

Important:
- Do NOT include any picture-based or image-based questions.
- Do NOT add explanations, commentary, or any text outside the JSON array.
- Output must be valid JSON only.
`;

  if (/^english$/i.test(subject)) {
    return baseInstruction + `
Language: English.
Restrict strictly to CAPITAL letters A to Z only.
Make questions about:
- Identifying letters ("Which is the letter B?")
- Sequence before/after ("What comes after C?")
- Missing letters ("A _ C")
`;
  } else if (/^urdu$/i.test(subject)) {
    return baseInstruction + `
Language: Urdu (use actual Urdu script, not Roman Urdu).
Restrict strictly to letters from ا to ی only.
Make questions about:
- Identifying letters ("یہ کون سا حرف ہے؟")
- Sequence before/after ("ب کے بعد کون آتا ہے؟")
- Missing letters ("ا _ ت")
`;
  } else if (/^(math|maths)$/i.test(subject)) {
    return baseInstruction + `
Language: English (numbers are universal).
Restrict strictly to numbers 1 through 10 only.
Make questions about:
- Identifying numbers 1-10
- Before/after in sequence ("What comes before 7?")
- Fill in missing number ("1, 2, _ , 4")
- Comparing small numbers up to 10 ("Which is bigger: 3 or 5?")
`;
  } else {
    return baseInstruction + `Language: English. Subject: ${subject}.`;
  }
}

/**
 * Generate quiz based on subject
 */
export async function generateQuiz(subject) {
  const prompt = buildPromptFor(subject);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // clean JSON (remove ```json ... ``` wrappers if Gemini adds them)
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}

/**
 * Safe answer comparison helper
 */
export function checkAnswer(selected, correct) {
  if (!selected || !correct) return false;
  return selected.trim().toLowerCase() === correct.trim().toLowerCase();
}
