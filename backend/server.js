import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// CORS — allow localhost, all *.vercel.app deployments, and any extra from env
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // curl / Postman / server-to-server
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  if (origin.endsWith('.vercel.app') || origin === 'https://vercel.app') return true;
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map(o => o.trim()).includes(origin);
  }
  return false;
};
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', model: 'gemini-2.5-flash', timestamp: new Date().toISOString() });
});

app.get('/api/ai-status', async (req, res) => {
  const { getProviderStatus } = await import('./services/aiService.js');
  res.status(200).json({ status: 'ok', providers: getProviderStatus() });
});

app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || 'NOT SET');
  console.log(`✅ SkillGap AI backend running on port ${PORT}`);
  console.log(`🔑 Gemini key: ${geminiKey !== 'NOT SET' ? geminiKey.slice(0, 8) + '...' : 'NOT SET'}`);
});