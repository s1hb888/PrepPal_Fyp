const axios = require('axios');
require('dotenv').config();

const generateQuiz = async (subject) => {
  let prompt;

  switch (subject.toLowerCase()) {
    case 'english':
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 on English alphabets. 
Focus on:
- identifying alphabet letters,
- completing missing letters in the sequence (like A _ C),
- choosing the correct alphabet for a picture (like Apple = A).

Each question must have 4 options and one correct answer.
Format as:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    case 'math':
    case 'maths':
      prompt = `Generate 10 basic math multiple-choice questions for kids aged 4 to 5.
Include:
- counting objects shown in visuals (mention visuals),
- identifying numbers,
- choosing what comes next (1, 2, __),
- comparing groups (e.g., which has more items).

Each question must have 4 options and one correct answer.
Format as:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    case 'urdu':
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 on Urdu alphabets (Huroof-e-Tahaji).
Include:
- identifying letters like 'Alif', 'Bay', 'Pay'
- completing sequences (e.g., Alif, ___, Pay)
- selecting correct letter for a picture (e.g., Aam = Alif)

Use Roman Urdu if necessary for understanding.
Each question must have 4 options and one correct answer.
Format as:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    default:
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 on the subject "${subject}". 
Each question must have 4 options and clearly indicate the correct answer. 
Format as:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;

    const lines = rawText.split('\n').filter((line) => line.trim() !== '');

    const questions = [];
    let current = null;

    lines.forEach((line) => {
      if (line.startsWith('Q:')) {
        if (current) questions.push(current);
        current = {
          question: line.replace('Q:', '').trim(),
          options: [],
          correctAnswer: '',
        };
      } else if (/^[a-d]\)/i.test(line)) {
        current?.options.push(line.replace(/^[a-d]\)\s*/, '').trim());
      } else if (line.toLowerCase().startsWith('answer:')) {
        const ans = line.replace('Answer:', '').trim();
        current.correctAnswer = ans.replace(/^[a-d]\)\s*/, '');
      }
    });

    if (current) questions.push(current);

    return questions;
  } catch (err) {
    console.error('Gemini error:', err.message);
    return null;
  }
};

module.exports = generateQuiz;

