const axios = require('axios');
require('dotenv').config();

const generateQuiz = async (subject) => {
  let prompt;

  switch (subject.toLowerCase()) {
    case 'english':
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 learning English alphabets.

Focus on:
- Identifying individual letters
- Completing missing letters in a sequence (like A _ C)
- Matching letters with pictures (e.g., Apple = A)

Each question should:
- Be simple
- Mention visuals where relevant (e.g., "Picture of Apple")
- Use one correct answer and 4 options

Format:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    case 'math':
    case 'maths':
      prompt = `Generate 10 basic math multiple-choice questions for preschool kids aged 4 to 5.

Include:
- Counting objects shown in visuals (e.g., "Image showing 3 apples")
- Identifying numbers (1 to 10)
- Completing sequences (e.g., 1, 2, __)
- Comparing quantities (e.g., which group has more)

Each question must:
- Clearly mention the visual if needed
- Have 4 options and 1 correct answer

Format:
Q: Question text?
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    case 'urdu':
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 learning Urdu alphabets (Huroof-e-Tahaji).

Focus on:
- Recognizing Urdu letters like الف، ب، پ
- Completing letter sequences (e.g., الف، ___، پ)
- Matching Urdu letters with images (e.g., آم = الف)

Instructions:
- Write the questions and options using **actual Urdu script**, not Roman Urdu
- Keep the language age-appropriate
- Each question must have 4 options and 1 correct answer

Format:
Q: سوال کا متن؟
a) Option A
b) Option B
c) Option C
d) Option D
Answer: a) Option A`;
      break;

    default:
      prompt = `Generate 10 multiple-choice questions for kids aged 4 to 5 on the subject "${subject}". Each question must have 4 options and 1 correct answer.

Format:
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
