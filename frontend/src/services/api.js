/**
 * api.js — Centralised Axios instance
 *
 * In development (Vite dev server), VITE_API_URL is empty and the Vite proxy
 * forwards /api/* to http://localhost:5000 automatically.
 *
 * In production (Vercel), VITE_API_URL must be set to the Render backend URL:
 *   VITE_API_URL=https://skillgap-ai-p78i.onrender.com
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — AI calls can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
