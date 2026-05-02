import { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, ChevronRight, CheckCircle2, Download, Share2, AlertCircle } from 'lucide-react';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['Frontend', 'Backend', 'SQL', 'MongoDB'];

const inputStyle = {
  width: '100%',
  padding: '14px 20px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text-primary)',
  fontSize: '1rem',
  marginBottom: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export const CertificationPage = () => {
  const [step, setStep] = useState('setup'); // setup | loading | quiz | result
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startTest = async () => {
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
    if (!phone.trim() || phone.trim().length < 6) return setError('Please enter a valid phone number.');

    setError('');
    setStep('loading');

    try {
      console.log('[CertificationPage] Fetching questions for category:', category);
      const response = await axios.get(`${API}/questions/${category.toLowerCase()}`);
      console.log('[CertificationPage] Response:', response.data);

      if (!response.data.success || !response.data.questions || response.data.questions.length === 0) {
        throw new Error('No questions found in database. Please contact the administrator.');
      }

      setQuestions(response.data.questions);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setStep('quiz');
    } catch (err) {
      console.error('[CertificationPage] Error fetching questions:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to load questions. Please try again.';
      setError(msg);
      setStep('setup');
    }
  };

  const handleAnswer = (selectedOption) => {
    if (showFeedback) return; // prevent double click
    setSelectedAnswer(selectedOption);
    setShowFeedback(true);

    const q = questions[currentIndex];
    const isCorrect = selectedOption === q.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    // Move to next question after 800ms feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
      } else {
        // Test complete
        setStep('result');
        saveResult(newScore);
      }
    }, 800);
  };

  const saveResult = async (finalScore) => {
    setSubmitting(true);
    try {
      const percentage = Math.round((finalScore / questions.length) * 100);
      await axios.post(`${API}/submit-test`, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        score: finalScore,
        total: questions.length,
        percentage,
        category,
      });
      console.log('[CertificationPage] Result saved successfully.');
    } catch (err) {
      console.error('[CertificationPage] Failed to save result:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const percentage = Math.round((score / questions.length) * 100);
      const response = await axios.post(
        `${API}/download/certificate`,
        { name: name.trim(), score, total: questions.length, percentage, category },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_${category}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CertificationPage] Certificate download failed:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const shareText = `I scored ${percentage}% in the ${category} Skill Certification on SkillGap AI! 🚀`;

  // ── SETUP ─────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card animate-fade-up" style={{ padding: '40px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, background: 'var(--accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BrainCircuit size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px' }}>Skill Certification Platform</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Answer 15 questions to earn your verified skill certificate.
            </p>
          </div>

          {/* Category Selection */}
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Select Category</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: `1.5px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
                  background: category === c ? 'var(--accent-dim)' : 'transparent',
                  color: category === c ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* User Details */}
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Your Details</p>
          <input
            type="text"
            placeholder="Full Name (for certificate)"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => { setPhone(e.target.value); setError(''); }}
            style={{ ...inputStyle, marginBottom: 0 }}
          />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
              <AlertCircle size={16} color="#f87171" />
              <span style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <button
            onClick={startTest}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
          >
            Start {category} Certification <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3, margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px' }}>Loading Questions...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching {category} questions from database</p>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────
  if (step === 'quiz' && questions.length > 0) {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card animate-fade-up" style={{ padding: '36px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {category} Certification
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), #818cf8)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>

          {/* Question */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.65, marginBottom: 24, color: 'var(--text-primary)' }}>
            {q.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => {
              let optBg = 'rgba(255,255,255,0.02)';
              let optBorder = 'var(--border)';
              let optColor = 'var(--text-primary)';

              if (showFeedback) {
                if (opt === q.correctAnswer) {
                  optBg = 'rgba(52,211,153,0.12)';
                  optBorder = '#34d399';
                  optColor = '#34d399';
                } else if (opt === selectedAnswer && opt !== q.correctAnswer) {
                  optBg = 'rgba(248,113,113,0.12)';
                  optBorder = '#f87171';
                  optColor = '#f87171';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={showFeedback}
                  style={{
                    background: optBg,
                    border: `1.5px solid ${optBorder}`,
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: optColor,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: showFeedback ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────
  if (step === 'result') {
    const grade = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Keep Practicing';
    const gradeColor = percentage >= 80 ? '#34d399' : percentage >= 60 ? '#fbbf24' : '#f87171';

    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card animate-fade-up" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#34d399" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px' }}>Certification Complete!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
            Great job, <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>!
          </p>

          {/* Score Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', marginBottom: 28 }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{percentage}%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6 }}>Score: {score} / {questions.length}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: gradeColor, marginTop: 10 }}>{grade}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{category} Certification</div>
          </div>

          {submitting && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Saving your result...</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={downloadCertificate}
              disabled={downloading}
              className="btn-primary"
              style={{ gap: 8 }}
            >
              {downloading
                ? <div className="spinner" style={{ width: 16, height: 16 }} />
                : <Download size={16} />
              }
              Download Certificate
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: 'rgba(37,211,102,0.1)', color: '#25D366',
                border: '1px solid rgba(37,211,102,0.3)',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
              }}
            >
              <Share2 size={15} /> WhatsApp
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://skillgap.ai')}&summary=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: 'rgba(10,102,194,0.1)', color: '#0a66c2',
                border: '1px solid rgba(10,102,194,0.3)',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
              }}
            >
              <Share2 size={15} /> LinkedIn
            </a>
          </div>

          <button
            onClick={() => {
              setStep('setup');
              setName(''); setEmail(''); setPhone('');
              setScore(0); setCurrentIndex(0); setQuestions([]);
            }}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              cursor: 'pointer', marginTop: 20, textDecoration: 'underline',
            }}
          >
            Take Another Certification
          </button>
        </div>
      </div>
    );
  }

  return null;
};
