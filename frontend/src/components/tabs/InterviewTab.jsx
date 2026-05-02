import { useState } from 'react';
import api from '../../services/api.js';
import {
  MessageSquare, Download, ChevronLeft, ChevronRight,
  Eye, AlertTriangle, Lightbulb, Target,
} from 'lucide-react';

const TYPE_COLORS = {
  Technical:       { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
  Behavioral:      { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)' },
  'Project-based': { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
  'Scenario-based':{ color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
};

const DIFF_COLORS = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };

// ─── Sub-tab buttons ─────────────────────────────────────────────
const SubTab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600,
      border: 'none', cursor: 'pointer', borderRadius: 10,
      background: active ? 'var(--accent-dim)' : 'transparent',
      color: active ? '#818cf8' : 'var(--text-muted)',
      transition: 'all 0.2s',
    }}
  >
    {icon} {label}
  </button>
);

// ─── Mistake card ────────────────────────────────────────────────
const MistakeSection = ({ title, icon, color, items }) => {
  if (!items?.length) return null;
  return (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}25`,
      borderRadius: 14, padding: '20px 24px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {icon}
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color }}>{title}</h4>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color, marginTop: 3, flexShrink: 0, fontSize: 8 }}>●</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Insight card ────────────────────────────────────────────────
const InsightSection = ({ title, icon, color, items }) => {
  if (!items?.length) return null;
  return (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}25`,
      borderRadius: 14, padding: '20px 24px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {icon}
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color }}>{title}</h4>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color, marginTop: 3, flexShrink: 0, fontSize: 8 }}>●</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export const InterviewTab = ({ data, extractedText }) => {
  const [loading, setLoading]           = useState(false);
  const [questions, setQuestions]       = useState([]);
  const [mistakes, setMistakes]         = useState({});
  const [insights, setInsights]         = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint]         = useState(false);
  const [error, setError]               = useState('');
  const [downloading, setDownloading]   = useState(false);
  const [subTab, setSubTab]             = useState('questions');
  const [language, setLanguage]         = useState('english');

  const fetchPrep = async (lang) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/interview-prep', {
        resumeText: extractedText || '',
        missingSkills: data.missingSkills,
        weakAreas: data.weakAreas || [],
        jobTitle: data.jobTitle,
        language: lang || language,
      });
      setQuestions(response.data.questions || []);
      setMistakes(response.data.mistakes || {});
      setInsights(response.data.insights || {});
      setCurrentIndex(0);
      setShowHint(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate interview prep.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (lang) => {
    setLanguage(lang);
    if (questions.length > 0) fetchPrep(lang);
  };

  const handleDownload = async () => {
    if (!questions.length) return;
    setDownloading(true);
    try {
      const response = await api.post('/download/interview', { questions }, {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/json' },
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Interview_Prep_Guide.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Download Interview]', err);
      setError('PDF download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const go = (dir) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < questions.length) {
      setCurrentIndex(next);
      setShowHint(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────
  if (!questions.length && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{
          width: 72, height: 72,
          background: 'rgba(192,132,252,0.1)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <MessageSquare size={32} color="#c084fc" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0 0 12px' }}>
          AI Interview Preparation Engine
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.7, margin: '0 0 28px', fontSize: '0.9rem' }}>
          Get <strong style={{ color: '#c084fc' }}>20 tailored questions</strong>, resume mistake analysis, and interviewer insights — all based on your uploaded resume and skill gaps.
        </p>

        {/* What you'll get */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Technical', color: '#60a5fa' },
            { label: 'Project-based', color: '#34d399' },
            { label: 'Scenario-based', color: '#fbbf24' },
            { label: 'Behavioral', color: '#c084fc' },
          ].map((t, i) => (
            <span key={i} style={{
              padding: '5px 14px', borderRadius: 99,
              fontSize: '0.8rem', fontWeight: 600,
              color: t.color, background: `${t.color}15`, border: `1px solid ${t.color}30`,
            }}>{t.label}</span>
          ))}
        </div>

        {/* Language toggle */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 28,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
        }}>
          {[
            { id: 'english', label: '🇬🇧 English' },
            { id: 'hinglish', label: '🇮🇳 Hinglish' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              style={{
                padding: '8px 20px', fontSize: '0.82rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: language === l.id ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: language === l.id ? '#818cf8' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >{l.label}</button>
          ))}
        </div>

        <button id="generate-questions-btn" onClick={() => fetchPrep(language)} className="btn-primary" style={{
          background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
        }}>
          <MessageSquare size={16} /> Generate Interview Prep
        </button>
        {error && <p style={{ color: '#f87171', marginTop: 16, fontSize: '0.85rem' }}>{error}</p>}
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderTopColor: '#c084fc', marginBottom: 20 }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Crafting your personalized interview prep...</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>Analyzing resume + generating questions, mistakes & insights</p>
        <div style={{ width: 280, marginTop: 24 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '100%', animation: 'shimmer 2s infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Result state ───────────────────────────────────────────
  const q = questions[currentIndex];
  const typeStyle = TYPE_COLORS[q?.type] || TYPE_COLORS.Technical;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 4px' }}>Interview Preparation</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {questions.length} questions · Resume analysis · {language === 'hinglish' ? 'Hinglish' : 'English'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Language toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
          }}>
            {[
              { id: 'english', label: 'EN' },
              { id: 'hinglish', label: 'HI' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => handleLanguageToggle(l.id)}
                style={{
                  padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: language === l.id ? 'rgba(129,140,248,0.15)' : 'transparent',
                  color: language === l.id ? '#818cf8' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >{l.label}</button>
            ))}
          </div>

          <button onClick={() => fetchPrep(language)} className="btn-ghost" style={{ fontSize: '0.8rem' }}>↺ Regenerate</button>
          <button
            id="download-interview-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 18px', background: 'linear-gradient(135deg, #065f46, #10b981)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
          >
            {downloading ? <><div className="spinner" />Downloading...</> : <><Download size={14} />Download PDF</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Sub-tabs: Questions | Mistakes | Insights */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 4,
      }}>
        <SubTab active={subTab === 'questions'} onClick={() => setSubTab('questions')}
          icon={<MessageSquare size={15} />} label="Questions" />
        <SubTab active={subTab === 'mistakes'} onClick={() => setSubTab('mistakes')}
          icon={<AlertTriangle size={15} />} label="Mistakes" />
        <SubTab active={subTab === 'insights'} onClick={() => setSubTab('insights')}
          icon={<Lightbulb size={15} />} label="Insights" />
      </div>

      {/* ═══ QUESTIONS SUB-TAB ═══ */}
      {subTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Category mini tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Technical', 'Behavioral', 'Project-based', 'Scenario-based'].map((type) => {
              const count = questions.filter(x => x.type === type).length;
              if (!count) return null;
              const s = TYPE_COLORS[type] || TYPE_COLORS.Technical;
              return (
                <span key={type} style={{
                  padding: '4px 12px', borderRadius: 99,
                  fontSize: '0.75rem', fontWeight: 600,
                  color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                }}>{type}: {count}</span>
              );
            })}
          </div>

          {/* Flashcard */}
          <div style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${typeStyle.border}`,
            borderRadius: 18, padding: '36px',
            minHeight: 260, display: 'flex', flexDirection: 'column', gap: 20,
            boxShadow: `0 0 40px ${typeStyle.bg}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 99,
                  fontSize: '0.75rem', fontWeight: 700,
                  color: typeStyle.color, background: typeStyle.bg,
                  border: `1px solid ${typeStyle.border}`,
                }}>{q?.type}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 99,
                  fontSize: '0.72rem', fontWeight: 600,
                  color: DIFF_COLORS[q?.difficulty] || 'var(--amber)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>{q?.difficulty}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Question {currentIndex + 1}</span>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
                {q?.question}
              </p>
            </div>

            {showHint ? (
              <div style={{
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12, padding: '16px 20px', animation: 'fadeInUp 0.3s ease',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  💡 Hint / Model Answer
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {q?.hint}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'transparent', border: '1px dashed rgba(99,102,241,0.3)',
                  borderRadius: 10, padding: '10px 18px',
                  color: '#818cf8', fontSize: '0.85rem', fontWeight: 500,
                  cursor: 'pointer', width: 'fit-content', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderStyle = 'solid'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}
              >
                <Eye size={15} /> Show Hint / Answer
              </button>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => go(-1)} disabled={currentIndex === 0} className="btn-ghost" id="prev-question-btn">
              <ChevronLeft size={16} /> Previous
            </button>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 }}>
              {questions.map((_, i) => (
                <button key={i}
                  onClick={() => { setCurrentIndex(i); setShowHint(false); }}
                  style={{
                    width: i === currentIndex ? 20 : 8, height: 8,
                    borderRadius: 99, background: i === currentIndex ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.25s ease', padding: 0,
                  }}
                />
              ))}
            </div>
            <button onClick={() => go(1)} disabled={currentIndex === questions.length - 1}
              className="btn-primary" id="next-question-btn" style={{ fontSize: '0.85rem', padding: '9px 20px' }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ MISTAKES SUB-TAB ═══ */}
      {subTab === 'mistakes' && (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          <MistakeSection
            title="Weak Points"
            icon={<AlertTriangle size={18} />}
            color="#f87171"
            items={mistakes.weakPoints}
          />
          <MistakeSection
            title="Poor Wording"
            icon={<MessageSquare size={18} />}
            color="#fb923c"
            items={mistakes.poorWording}
          />
          <MistakeSection
            title="Missing Impact"
            icon={<Target size={18} />}
            color="#fbbf24"
            items={mistakes.missingImpact}
          />
          {(!mistakes.weakPoints?.length && !mistakes.poorWording?.length && !mistakes.missingImpact?.length) && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No mistakes data available.</p>
          )}
        </div>
      )}

      {/* ═══ INSIGHTS SUB-TAB ═══ */}
      {subTab === 'insights' && (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          <InsightSection
            title="What Interviewer Will Focus On"
            icon={<Target size={18} />}
            color="#60a5fa"
            items={insights.interviewerFocus}
          />
          <InsightSection
            title="Red Flags"
            icon={<AlertTriangle size={18} />}
            color="#f87171"
            items={insights.redFlags}
          />
          <InsightSection
            title="Strong Points to Leverage"
            icon={<Lightbulb size={18} />}
            color="#34d399"
            items={insights.strongPoints}
          />
          {(!insights.interviewerFocus?.length && !insights.redFlags?.length && !insights.strongPoints?.length) && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No insights data available.</p>
          )}
        </div>
      )}
    </div>
  );
};
