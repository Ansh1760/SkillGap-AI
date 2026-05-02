import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();


// ✅ TEMP CORS (debug ke liye - sab allow)
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());


// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ✅ Root route (fix "Cannot GET /")
app.get('/', (req, res) => {
  res.send('🚀 SkillGap AI Backend is running');
});


// ✅ API routes
app.use('/api', apiRoutes);


// ✅ Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});


// ✅ AI status
app.get('/api/ai-status', async (req, res) => {
  const { getProviderStatus } = await import('./services/aiService.js');
  res.status(200).json({
    status: 'ok',
    providers: getProviderStatus()
  });
});


// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});