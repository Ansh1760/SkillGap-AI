import { parseFile } from '../utils/parser.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateResumePDF, generateInterviewPDF } from '../services/pdfService.js';
import { generateAIContent } from '../services/aiService.js';

const MODEL = 'gemini-2.5-flash';

// Kept for backward-compat with certificationController.js (getModel import)
export const getModel = () => {
  const apiKey = (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'dummy_key' || apiKey === 'your_openai_api_key_here') {
    throw new Error('Gemini API key is missing or invalid. Please configure GEMINI_API_KEY in .env');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL });
};

const parseJSON = (rawText) => {
  let text = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];
  return JSON.parse(text);
};


// ─────────────────────────────────────────────────────────────
// ANALYZE RESUME
// ─────────────────────────────────────────────────────────────
export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'Resume file is required.' });
    if (!jobDescription) return res.status(400).json({ error: 'Job description is required.' });

    const resumeText = await parseFile(file.buffer, file.mimetype);

    const prompt = `
You are a senior technical recruiter and ATS (Applicant Tracking System) expert with 10+ years of experience.

Analyze the following resume against the job description with extreme precision.

=== RESUME ===
${resumeText.substring(0, 6000)}

=== JOB DESCRIPTION ===
${jobDescription.substring(0, 4000)}

=== YOUR TASK ===
1. Extract all technical and soft skills mentioned in the JD.
2. Compare them against what's present in the resume.
3. Calculate a realistic matchScore (0-100) based on:
   - Keyword overlap (40%)
   - Experience level match (30%)
   - Technology stack alignment (20%)
   - Overall fit (10%)
4. Identify specific weak areas (e.g., "No cloud experience", "Missing system design knowledge").
5. Give actionable recommendations.

Respond ONLY with this exact JSON format (no extra text, no markdown):
{
  "matchScore": <integer 0-100>,
  "jobTitle": "<extracted job title from JD>",
  "matchingSkills": ["<skill>", ...],
  "missingSkills": ["<skill>", ...],
  "weakAreas": ["<specific area with reason>", ...],
  "recommendations": ["<specific actionable advice>", ...]
}
`;

    const text = await generateAIContent(prompt);
    const data = parseJSON(text);

    res.status(200).json({ success: true, data, extractedResumeText: resumeText });
  } catch (error) {
    console.error('[analyzeResume] Error:', error.message);
    res.status(500).json({ error: error.message || 'Analysis failed.' });
  }
};

// ─────────────────────────────────────────────────────────────
// OPTIMIZE RESUME
// ─────────────────────────────────────────────────────────────
export const optimizeResume = async (req, res) => {
  try {
    const { resumeText, missingSkills, jobTitle } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required.' });

    const skillsList = (missingSkills || []).join(', ') || 'modern software development practices';
    const role = jobTitle || 'the target role';

    const prompt = `
You are a professional resume editor — not a resume writer. Your job is to lightly improve an existing resume, not rewrite it.

=== ORIGINAL RESUME ===
${resumeText.substring(0, 6000)}

=== TARGET ROLE ===
${role}

=== SKILLS TO NATURALLY INTEGRATE (only where genuinely relevant) ===
${skillsList}

=== YOUR TASK ===
Improve ONLY what is weak. Keep everything else exactly as-is.

1. PRESERVE the same structure, same sections, same number of bullet points per role/project.
2. FIX only weak, vague, or grammatically poor bullet points — make them concise and professional.
3. TIGHTEN the professional summary — 2-3 sentences, clear, not over-inflated.
4. CLEAN UP the skills list — remove duplicates, fix typos, group logically. Do not add skills that aren't already in the resume unless they appear in the JD and the candidate clearly has exposure to them.
5. DO NOT add fake metrics (e.g., "improved performance by 40%") unless the original resume already implies a measurable result.
6. DO NOT change job titles, company names, dates, or project names.
7. DO NOT add new sections (no Certifications, Awards, Publications, etc. unless they already exist).
8. Keep the overall length nearly the same — do not pad or over-expand.
9. Write in a natural, human developer voice — avoid buzzword-heavy or overly formal AI phrasing.

RULES:
- DO fix grammar and awkward wording
- DO make bullets start with strong action verbs if they don't already
- DO remove unnecessary filler words and repetition
- DO NOT fabricate experience, titles, or metrics
- DO NOT rewrite everything — only fix what is genuinely weak
- The result should feel like a developer cleaned up their own resume, not like an AI generated it

Return ONLY this exact JSON (no markdown, no extra text):
{
  "name": "<full name from resume — unchanged>",
  "summary": "<improved but not inflated 2-3 sentence summary>",
  "skills": ["<skill1>", "<skill2>", ...],
  "experience": [
    {
      "role": "<exact job title from resume — unchanged>",
      "company": "<exact company name — unchanged>",
      "duration": "<exact dates — unchanged>",
      "bullets": ["<improved or unchanged bullet>", ...]
    }
  ],
  "projects": [
    {
      "name": "<exact project name — unchanged>",
      "tech": "<tech stack from resume — unchanged or lightly cleaned>",
      "bullets": ["<improved or unchanged bullet>", ...]
    }
  ]
}
`;

    const text = await generateAIContent(prompt);
    const optimizedResume = parseJSON(text);

    res.status(200).json({ success: true, optimizedResume });
  } catch (error) {
    console.error('[optimizeResume] Error:', error.message);
    res.status(500).json({ error: 'Failed to optimize resume: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GENERATE INTERVIEW QUESTIONS
// ─────────────────────────────────────────────────────────────
export const generateQuestions = async (req, res) => {
  try {
    const { missingSkills, weakAreas, jobTitle } = req.body;

    const skills = (missingSkills || []).join(', ') || 'general software engineering';
    const areas = (weakAreas || []).join(', ') || 'system design and problem solving';
    const role = jobTitle || 'Software Engineer';

    const prompt = `
You are a senior ${role} interviewer at a top tech company (FAANG-level). Your job is to design a rigorous, targeted interview to assess a candidate's readiness for the role.

=== CANDIDATE'S GAPS ===
Missing Skills: ${skills}
Weak Areas: ${areas}

=== YOUR TASK ===
Generate exactly 15 interview questions (5 Technical, 5 Behavioral, 5 Project-based) that:
1. TECHNICAL: Are specific to the missing skills, not generic. Include questions that test depth of understanding, edge cases, tradeoffs.
2. BEHAVIORAL: Use STAR format framing. Focus on leadership, problem-solving under pressure, collaboration.
3. PROJECT-BASED: Ask candidates to walk through technical decisions, architecture choices, and lessons learned.

For each question provide:
- A thoughtful, non-trivial question (not "What is React?")
- A concise but detailed hint/model answer that shows what a good answer looks like

Return ONLY this exact JSON (no markdown, no extra text):
{
  "questions": [
    {
      "type": "Technical",
      "difficulty": "Hard",
      "question": "<specific, deep technical question>",
      "hint": "<model answer outline with key points the candidate should mention>"
    },
    {
      "type": "Behavioral",
      "difficulty": "Medium",
      "question": "<STAR-framed behavioral question>",
      "hint": "<what a strong STAR answer looks like>"
    },
    {
      "type": "Project-based",
      "difficulty": "Medium",
      "question": "<project walk-through or architecture question>",
      "hint": "<key technical points and decision-making framework to mention>"
    }
  ]
}
`;

    const text = await generateAIContent(prompt);
    const parsed = parseJSON(text);

    res.status(200).json({ success: true, questions: parsed.questions });
  } catch (error) {
    console.error('[generateQuestions] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GENERATE FULL INTERVIEW PREP (Questions + Mistakes + Insights)
// ─────────────────────────────────────────────────────────────
export const generateInterviewPrep = async (req, res) => {
  try {
    const { resumeText, missingSkills, weakAreas, jobTitle, language } = req.body;
    const skills = (missingSkills || []).join(', ') || 'general software engineering';
    const areas = (weakAreas || []).join(', ') || 'system design and problem solving';
    const role = jobTitle || 'Software Engineer';
    const isHinglish = language === 'hinglish';

    const langNote = isHinglish
      ? 'IMPORTANT: Write ALL text in natural Hinglish — casual Hindi-English mix as spoken by Indian tech professionals. Keep technical terms in English.'
      : 'Write everything in clear, professional English.';

    const prompt = `You are a senior ${role} interviewer and career coach. ${langNote}

=== RESUME ===
${(resumeText || '').substring(0, 5000)}

=== GAPS ===
Missing: ${skills}
Weak: ${areas}

Generate a JSON with 3 sections:
1. "questions" array (20 items): 6 Technical, 5 Project-based, 5 Scenario-based, 4 Behavioral. Each has type, difficulty (Easy/Medium/Hard), question, hint.
2. "mistakes" object: weakPoints (array 3-5), poorWording (array 3-5), missingImpact (array 3-5).
3. "insights" object: interviewerFocus (array 3-5), redFlags (array 2-4), strongPoints (array 3-5).

Return ONLY valid JSON, no markdown:
{"questions":[{"type":"Technical","difficulty":"Hard","question":"...","hint":"..."}],"mistakes":{"weakPoints":[],"poorWording":[],"missingImpact":[]},"insights":{"interviewerFocus":[],"redFlags":[],"strongPoints":[]}}`;

    const text = await generateAIContent(prompt);
    const parsed = parseJSON(text);

    res.status(200).json({
      success: true,
      questions: parsed.questions || [],
      mistakes: parsed.mistakes || {},
      insights: parsed.insights || {},
    });
  } catch (error) {
    console.error('[generateInterviewPrep] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate interview prep: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PDF DOWNLOADS
// ─────────────────────────────────────────────────────────────
export const downloadResumePDF = (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'Resume data required' });
    generateResumePDF(resumeData, res);
  } catch (error) {
    console.error('[downloadResumePDF] Error:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

export const downloadInterviewPDF = (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !questions.length) return res.status(400).json({ error: 'Questions required' });
    generateInterviewPDF(questions, res);
  } catch (error) {
    console.error('[downloadInterviewPDF] Error:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

export const downloadCertificate = (req, res) => {
  try {
    const { name, score, total, percentage, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and Category required' });
    import('../services/pdfService.js').then(({ generateCertificatePDF }) => {
      generateCertificatePDF({ name, score, total, percentage, category }, res);
    });
  } catch (error) {
    console.error('[downloadCertificate] Error:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate Certificate PDF' });
  }
};
