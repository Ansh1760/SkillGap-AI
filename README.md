<<<<<<< HEAD
# SkillGap AI

> **AI-Powered Resume Analyzer & Interview Preparation Platform**

SkillGap AI is a full-stack web application that helps developers and job seekers land their dream jobs by leveraging Google Gemini AI to analyze resumes, identify skill gaps, generate tailored interview questions, and provide a complete career preparation suite.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **ATS Resume Analysis** | Upload a resume (PDF/DOCX), paste a job description, get an ATS match score with detailed skill gap analysis |
| 📝 **AI Resume Optimizer** | Automatically improve resume bullets and summary to match the target role |
| 🎤 **Interview Prep Engine** | 20 tailored questions (Technical, Behavioral, Project-based, Scenario), common mistakes, and interviewer insights |
| 🏗️ **Resume Builder** | Step-by-step builder with live preview and professional PDF export |
| 🏆 **Skills Certification** | Frontend, Backend, SQL, MongoDB MCQ tests with AI-generated questions and downloadable certificates |
| 📚 **Study Resources** | Curated learning resources for career growth |
| 📄 **PDF Downloads** | Export resumes, interview guides, and certificates as professional PDFs |
| 🔄 **AI Fallback** | Automatic Gemini → Groq/Grok fallback for 100% uptime even under quota limits |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + React Router v7
- **Vite 8** (dev server + build)
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **jsPDF** (client-side PDF generation)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express 5**
- **Google Gemini 2.5 Flash** (primary AI)
- **Groq / xAI Grok** (AI fallback)
- **MongoDB** + **Mongoose** (result persistence)
- **PDFKit** (server-side PDF generation)
- **Multer** (file uploads)
- **pdf-parse** + **Mammoth** (resume parsing)

---

## 📁 Project Structure

```
Skills-Ai/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── analysisController.js  # Resume analysis, optimize, interview, PDF
│   │   └── certificationController.js  # MCQ generation & results
│   ├── models/
│   │   ├── Question.js            # MCQ schema
│   │   └── Result.js              # Test result schema
│   ├── routes/
│   │   └── api.js                 # All API routes
│   ├── services/
│   │   ├── aiService.js           # Gemini → Groq fallback AI service
│   │   └── pdfService.js          # PDFKit resume/interview/certificate generation
│   ├── utils/
│   │   └── parser.js              # PDF & DOCX text extraction
│   ├── .env                       # 🔒 Your secrets (never commit)
│   ├── .env.example               # Template for env variables
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/
│   │   │   │   ├── InterviewTab.jsx   # Interview prep UI
│   │   │   │   ├── ResumeTab.jsx      # Resume optimizer UI
│   │   │   │   └── SkillGapTab.jsx    # ATS score display
│   │   │   ├── Dashboard.jsx      # Main results dashboard
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   └── UploadSection.jsx  # Resume + JD upload
│   │   ├── pages/
│   │   │   ├── CertificationPage.jsx  # Skills MCQ test
│   │   │   ├── ResumeBuilder.jsx      # Step-by-step builder
│   │   │   ├── ResumePreview.jsx      # Preview + jsPDF export
│   │   │   └── StudyResources.jsx     # Learning resources
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier available)
- MongoDB Atlas URI (optional — falls back to in-memory MongoDB)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/skillgap-ai.git
cd skillgap-ai
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and MONGO_URI
npm install
npm run dev
```

Backend will start on **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

> The Vite dev server proxies `/api/*` requests to `localhost:5000` automatically — no CORS issues.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `GROK_API_KEY` | No | Groq (`gsk_...`) or xAI Grok (`xai-...`) fallback key |
| `MONGO_URI` | No | MongoDB Atlas URI. If absent, uses in-memory MongoDB |
| `CORS_ORIGIN` | No | Production frontend URL(s), comma-separated |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend URL for production builds |

> In development, the Vite proxy handles all `/api` calls — no `VITE_API_URL` needed.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Analyze resume vs job description |
| `POST` | `/api/optimize` | Optimize resume text |
| `POST` | `/api/interview-questions` | Generate 15 interview questions |
| `POST` | `/api/interview-prep` | Full interview prep (questions + mistakes + insights) |
| `POST` | `/api/download/resume` | Download ATS-optimized resume as PDF |
| `POST` | `/api/download/interview` | Download interview prep guide as PDF |
| `POST` | `/api/download/certificate` | Download skills certificate as PDF |
| `GET` | `/api/questions/:type` | Get MCQ questions (`frontend`/`backend`/`sql`/`mongodb`) |
| `POST` | `/api/submit-test` | Submit test result to MongoDB |
| `GET` | `/api/results` | Get all test results |
| `GET` | `/health` | Health check |
| `GET` | `/api/ai-status` | Check AI provider status |

---

## 📦 Deployment

### Option 1: Deploy to Railway (Recommended — Full Stack)

1. Push to GitHub
2. Create a new [Railway](https://railway.app) project
3. Add the `backend/` folder as a service
4. Set environment variables in Railway dashboard
5. Deploy frontend to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
6. Set `CORS_ORIGIN` to your Vercel/Netlify URL
7. Set `VITE_API_URL` in Vercel/Netlify to your Railway backend URL

### Option 2: Deploy Backend to Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `.env.example`

### Option 3: Docker

```dockerfile
# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 5000
CMD ["node", "server.js"]
```

### Production Checklist

- [ ] `GEMINI_API_KEY` is set
- [ ] `MONGO_URI` is set to production MongoDB Atlas
- [ ] `CORS_ORIGIN` is set to your frontend domain
- [ ] `NODE_ENV=production` is set
- [ ] Frontend build completes without errors (`npm run build`)
- [ ] Health check `/health` returns `{ status: 'ok' }`

---

## 🧪 Build Verification

```bash
# Verify backend starts
cd backend && npm start

# Verify frontend builds
cd frontend && npm run build

# Check health endpoint
curl http://localhost:5000/health
```

---

## 📝 License

MIT — free to use, modify, and deploy.
=======
# SkillGap-AI
Skill Gap AI is an intelligent system that analyzes a user’s resume against a job description to identify missing or weak skills. It compares required skills with existing ones and provides a clear, actionable roadmap to help users improve their qualifications and increase their chances of getting hired.
>>>>>>> 6919c6cda5ecf20292834ef282402f542f62873b
