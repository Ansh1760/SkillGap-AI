import Question from '../models/Question.js';
import Result from '../models/Result.js';
import { generateAIContent } from '../services/aiService.js';

// ─────────────────────────────────────────────────────────────
// GET QUESTIONS — generates via Gemini AI directly (no MongoDB)
// ─────────────────────────────────────────────────────────────
export const getQuestions = async (req, res) => {
  try {
    const type = req.params.type;
    if (!type) return res.status(400).json({ error: 'Type parameter is required' });

    const categoryMap = {
      'frontend': 'Frontend',
      'backend':  'Backend',
      'sql':      'SQL',
      'mongodb':  'MongoDB',
    };
    const category = categoryMap[type.toLowerCase()] || type;

    const topicMap = {
      Frontend: 'HTML (5 questions), CSS (5 questions), JavaScript (5 questions)',
      Backend:  'Node.js (5 questions), Express.js & REST APIs (5 questions), server-side concepts (5 questions)',
      SQL:      'SQL SELECT & filtering (3), JOINs (3), indexing & performance (3), normalization (3), transactions (3)',
      MongoDB:  'CRUD operations (3), aggregation pipeline (3), schema design (3), indexing (3), Mongoose (3)',
    };
    const topics = topicMap[category] || category;

    const prompt = `
You are an expert technical interviewer and educator.
Generate exactly 15 unique Multiple Choice Questions (MCQs) for a "${category} Skills Test".
Topics: ${topics}.
Difficulty: mix of Beginner, Intermediate, and Advanced.
Each question must have exactly 4 options. The correct answer must be unambiguous.
The 3 wrong options must be plausible distractors — not obviously wrong.

Return ONLY this exact JSON (no markdown, no explanation, no extra text):
{
  "questions": [
    {
      "category": "${category}",
      "question": "<question text>",
      "options": ["<option 1>", "<option 2>", "<option 3>", "<option 4>"],
      "correctAnswer": "<exact string of the correct option>"
    }
  ]
}
`;

    const rawText = await generateAIContent(prompt);
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned invalid JSON format');

    const parsed = JSON.parse(match[0]);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('AI returned invalid questions structure');
    }

    const valid = parsed.questions.filter(q =>
      q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer
    );
    if (valid.length < 5) throw new Error('Too few valid questions returned by AI');

    res.status(200).json({ success: true, questions: valid });

  } catch (error) {
    console.error('[getQuestions] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SUBMIT TEST RESULT (best-effort — won't break if MongoDB is down)
// ─────────────────────────────────────────────────────────────
export const submitResult = async (req, res) => {
  try {
    const { name, email, phone, score, total, percentage, category } = req.body;

    if (!name || !email || !phone || score === undefined || !total || !percentage || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newResult = new Result({
        name,
        email,
        phone,
        score,
        total,
        percentage,
        category
      });
      await newResult.save();
    } catch (dbErr) {
      console.warn('[submitResult] MongoDB unavailable, result not persisted:', dbErr.message);
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[submitResult] Error:', error.message);
    res.status(500).json({ error: 'Failed to save result: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET RESULTS (Admin View)
// ─────────────────────────────────────────────────────────────
export const getResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ date: -1 });
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('[getResults] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch results: ' + error.message });
  }
};
