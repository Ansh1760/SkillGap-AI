/**
 * aiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified AI service with automatic Gemini → Groq/Grok fallback.
 *
 * Usage:
 *   import { generateAIContent } from '../services/aiService.js';
 *   const text = await generateAIContent(prompt);
 *
 * Flow:
 *   1. Try Gemini (primary)  — up to GEMINI_RETRIES attempts with backoff
 *   2. If Gemini fails (quota/rate/network) → switch to Groq or Grok
 *   3. If both fail → throw a consolidated error
 *
 * Env vars:
 *   GEMINI_API_KEY  — Gemini key (also accepts OPENAI_API_KEY for compat)
 *   GROK_API_KEY    — Groq key (gsk_...) or xAI Grok key (xai-...)
 *                     Auto-detected by key prefix.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import https from 'https';

// ── Config ────────────────────────────────────────────────────────────────────
const GEMINI_MODEL  = 'gemini-2.5-flash';

// Groq (groq.com) — free tier, fast Llama models, key starts with gsk_
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';

// xAI Grok — key starts with xai-
const GROK_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL    = 'grok-3-fast';

const GEMINI_RETRIES   = 3;
const FALLBACK_RETRIES = 2;

const PLACEHOLDER_KEYS = new Set([
  'your_grok_api_key_here',
  'your_groq_api_key_here',
  'your_gemini_api_key_here',
  'dummy_key',
  '',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const isTransient = (msg = '') =>
  msg.includes('503')  ||
  msg.includes('Service Unavailable') ||
  msg.includes('429')  ||
  msg.includes('Too Many Requests')   ||
  msg.includes('Quota exceeded')      ||
  msg.includes('quota')               ||
  msg.includes('RESOURCE_EXHAUSTED')  ||
  msg.includes('network')             ||
  msg.includes('ECONNRESET')          ||
  msg.includes('ETIMEDOUT')           ||
  msg.includes('fetch failed');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const backoffMs = (attempt, isQuota) =>
  isQuota ? 15_000 * attempt : 3_000 * attempt;

/** Detect which fallback provider to use based on key prefix */
const detectFallbackProvider = (key) => {
  if (!key || PLACEHOLDER_KEYS.has(key)) return null;
  if (key.startsWith('gsk_'))  return { name: 'Groq',       endpoint: GROQ_ENDPOINT, model: GROQ_MODEL };
  if (key.startsWith('xai-'))  return { name: 'Grok (xAI)', endpoint: GROK_ENDPOINT, model: GROK_MODEL };
  return { name: 'Groq', endpoint: GROQ_ENDPOINT, model: GROQ_MODEL };
};

// ── Gemini ────────────────────────────────────────────────────────────────────

const callGemini = async (prompt) => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey || PLACEHOLDER_KEYS.has(apiKey) || apiKey === 'your_openai_api_key_here') {
    throw new Error('Gemini API key missing — skipping Gemini.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model  = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  let lastError;
  for (let attempt = 1; attempt <= GEMINI_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      if (isTransient(msg) && attempt < GEMINI_RETRIES) {
        const wait = backoffMs(attempt, msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED'));
        console.warn(`[AI] Gemini transient error (attempt ${attempt}): ${msg.substring(0, 80)}. Retrying in ${wait / 1000}s...`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

// ── OpenAI-compatible fallback (Groq or xAI Grok) ────────────────────────────

const httpPost = (endpoint, apiKey, bodyStr) =>
  new Promise((resolve, reject) => {
    const parsed  = new URL(endpoint);
    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${raw.substring(0, 300)}`));
        }
        try {
          const json    = JSON.parse(raw);
          const content = json?.choices?.[0]?.message?.content;
          if (!content) return reject(new Error('Empty response content from provider'));
          resolve(content);
        } catch (e) {
          reject(new Error('Failed to parse provider response JSON'));
        }
      });
    });

    req.on('error', (e)  => reject(new Error(`Network error: ${e.message}`)));
    req.setTimeout(90_000, () => {
      req.destroy();
      reject(new Error('Request timed out after 90s'));
    });

    req.write(bodyStr);
    req.end();
  });

const callFallback = async (prompt) => {
  const apiKey   = (process.env.GROK_API_KEY || '').trim();
  const provider = detectFallbackProvider(apiKey);

  if (!provider) {
    throw new Error(
      'No fallback API key configured. Add GROK_API_KEY=gsk_... (Groq) or GROK_API_KEY=xai-... (xAI Grok) to .env'
    );
  }

  console.warn(`[AI] Gemini failed. Switching to ${provider.name} fallback (model: ${provider.model})...`);

  const bodyStr = JSON.stringify({
    model: provider.model,
    messages: [
      {
        role:    'system',
        content: 'You are a precise AI assistant. Always respond with valid JSON when asked. Never include markdown code fences.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens:  8192,
  });

  let lastError;
  for (let attempt = 1; attempt <= FALLBACK_RETRIES; attempt++) {
    try {
      const text = await httpPost(provider.endpoint, apiKey, bodyStr);
      return text;
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      if (isTransient(msg) && attempt < FALLBACK_RETRIES) {
        const wait = backoffMs(attempt, msg.includes('429'));
        console.warn(`[AI] ${provider.name} transient error (attempt ${attempt}): ${msg.substring(0, 80)}. Retrying in ${wait / 1000}s...`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * generateAIContent(prompt)
 *
 * Call this from all controllers. Automatically tries Gemini first,
 * then falls back to Groq (gsk_ key) or xAI Grok (xai- key).
 */
export const generateAIContent = async (prompt) => {
  // 1. Try Gemini
  try {
    return await callGemini(prompt);
  } catch (geminiErr) {
    const msg = geminiErr.message || '';
    const shouldFallback =
      isTransient(msg)                         ||
      msg.toLowerCase().includes('key')        ||
      msg.toLowerCase().includes('missing')    ||
      msg.toLowerCase().includes('quota')      ||
      msg.toLowerCase().includes('exhausted');

    if (!shouldFallback) {
      throw geminiErr;
    }
    console.warn(`[AI] Gemini failed (${msg.substring(0, 120)}). Switching to fallback...`);
  }

  // 2. Try fallback provider
  try {
    return await callFallback(prompt);
  } catch (fallbackErr) {
    const fbMsg = fallbackErr.message || '';
    console.error(`[AI] All providers failed: ${fbMsg.substring(0, 120)}`);
    throw new Error(
      `Both AI providers failed.\n` +
      `• Gemini: quota exceeded or key invalid — check GEMINI_API_KEY in .env\n` +
      `• Fallback (${fbMsg.substring(0, 100)})\n` +
      `If using Groq, ensure GROK_API_KEY=gsk_... is set in backend/.env`
    );
  }
};

// ── Status helper ─────────────────────────────────────────────────────────────
export const getProviderStatus = () => {
  const geminiKey   = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  const fallbackKey = (process.env.GROK_API_KEY || '').trim();
  const provider    = detectFallbackProvider(fallbackKey);

  return {
    gemini: {
      model:         GEMINI_MODEL,
      keyConfigured: !!(geminiKey && !PLACEHOLDER_KEYS.has(geminiKey) && geminiKey !== 'your_openai_api_key_here'),
    },
    fallback: {
      provider:      provider?.name    || 'none',
      model:         provider?.model   || 'none',
      endpoint:      provider?.endpoint || 'none',
      keyConfigured: !!provider,
      keyPrefix:     fallbackKey ? fallbackKey.substring(0, 6) + '...' : 'not set',
    },
  };
};
