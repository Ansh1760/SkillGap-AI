import { useState } from 'react';
import api from '../../services/api.js';
import { Download, FileText, User, Briefcase, Code2, FolderGit2, Eye, GitCompare, RotateCcw } from 'lucide-react';

// ─────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────

/** Strip broken unicode / extra whitespace from any string */
const cleanStr = (s) => {
  if (!s) return '';
  return String(s)
    .replace(/[\u25b8\u25b6\u25ba\u2192]/g, '')   // arrow chars
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201c\u201d]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/** Parse bullet-looking lines from raw extracted resume text */
const parseBulletsFromText = (rawText) => {
  if (!rawText) return [];
  return rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 12 && /^[-\u2022\u25b8\u25cf*]/.test(l))
    .map((l) => l.replace(/^[-\u2022\u25b8\u25cf*]\s*/, '').trim());
};

/** Word-level diff between two strings. Returns tokens [{word, type}] */
const wordDiff = (original, improved) => {
  if (!original) return improved.split(' ').map((w) => ({ word: w, type: 'added' }));
  if (!improved) return original.split(' ').map((w) => ({ word: w, type: 'removed' }));

  const ow = original.split(/\s+/);
  const iw = improved.split(/\s+/);
  const ol = ow.map((w) => w.toLowerCase());
  const il = iw.map((w) => w.toLowerCase());
  const m = ol.length, n = il.length;

  // LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = ol[i - 1] === il[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  // Backtrack
  const tokens = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ol[i - 1] === il[j - 1]) {
      tokens.unshift({ word: iw[j - 1], type: 'same' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ word: iw[j - 1], type: 'added' });
      j--;
    } else {
      tokens.unshift({ word: ow[i - 1], type: 'removed' });
      i--;
    }
  }
  return tokens;
};

/** Find best-matching original bullet for an improved bullet */
const bestMatch = (improved, originals) => {
  if (!originals.length) return null;
  const impWords = new Set(improved.toLowerCase().split(/\s+/));
  let best = null, bestScore = 0;
  originals.forEach((orig) => {
    const origWords = new Set(orig.toLowerCase().split(/\s+/));
    const intersection = [...impWords].filter((w) => origWords.has(w)).length;
    const union = new Set([...impWords, ...origWords]).size;
    const score = union > 0 ? intersection / union : 0;
    if (score > bestScore) { bestScore = score; best = orig; }
  });
  return bestScore > 0.2 ? best : null;
};

// ─────────────────────────────────────────────────────────
// DIFF TOKEN RENDERER
// ─────────────────────────────────────────────────────────
const DiffLine = ({ original, improved }) => {
  const tokens = wordDiff(original, improved);
  const hasChanges = tokens.some((t) => t.type !== 'same');
  if (!hasChanges) {
    return (
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7 }}>
        {improved}
      </span>
    );
  }
  return (
    <span style={{ fontSize: '0.84rem', lineHeight: 1.9 }}>
      {tokens.map((t, idx) => {
        if (t.type === 'same') return <span key={idx} style={{ color: 'var(--text-secondary)' }}>{t.word} </span>;
        if (t.type === 'added') return (
          <span key={idx} style={{
            background: 'rgba(34,197,94,0.18)',
            color: '#4ade80',
            borderRadius: 3,
            padding: '0 3px',
            fontWeight: 600,
          }}>{t.word} </span>
        );
        return (
          <span key={idx} style={{
            color: '#f87171',
            textDecoration: 'line-through',
            opacity: 0.7,
          }}>{t.word} </span>
        );
      })}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// SECTION HEADER (in preview)
// ─────────────────────────────────────────────────────────
const ResumeSection = ({ icon, title, children }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: '1.5px solid #334155',
      paddingBottom: 8, marginBottom: 14,
    }}>
      <span style={{ color: '#60a5fa' }}>{icon}</span>
      <h4 style={{
        margin: 0, fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa',
      }}>{title}</h4>
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export const ResumeTab = ({ data, extractedText }) => {
  const [loading,        setLoading]        = useState(false);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [originalBullets, setOriginalBullets] = useState([]);
  const [error,          setError]          = useState('');
  const [downloading,    setDownloading]    = useState(false);
  const [view,           setView]           = useState('improved'); // 'improved' | 'compare'

  // ── Generate ───────────────────────────────────────────
  const generateResume = async () => {
    setLoading(true);
    setError('');
    setView('improved');
    try {
      const response = await api.post('/optimize', {
        resumeText:    extractedText,
        missingSkills: data.missingSkills,
        jobTitle:      data.jobTitle,
      });
      const resume = response.data.optimizedResume;

      // Clean all string fields before storing
      const cleaned = {
        name:    cleanStr(resume.name),
        summary: cleanStr(resume.summary),
        skills:  (resume.skills || []).map(cleanStr).filter(Boolean),
        experience: (resume.experience || []).map((e) => ({
          role:     cleanStr(e.role),
          company:  cleanStr(e.company),
          duration: cleanStr(e.duration),
          bullets:  (e.bullets || []).map(cleanStr).filter(Boolean),
        })),
        projects: (resume.projects || []).map((p) => ({
          name:    cleanStr(p.name),
          tech:    cleanStr(p.tech),
          bullets: (p.bullets || []).map(cleanStr).filter(Boolean),
        })),
      };

      setOriginalBullets(parseBulletsFromText(extractedText));
      setOptimizedResume(cleaned);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Download PDF ───────────────────────────────────────
  const handleDownload = async () => {
    if (!optimizedResume) return;
    setDownloading(true);
    try {
      const response = await api.post('/download/resume',
        { resumeData: optimizedResume },
        { responseType: 'blob', headers: { 'Content-Type': 'application/json' } }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ATS_Optimized_Resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Download Resume]', err);
      setError('PDF download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Empty state ────────────────────────────────────────
  if (!optimizedResume && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--accent-dim)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <FileText size={32} color="#818cf8" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0 0 12px' }}>
          Generate ATS-Optimized Resume
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.7, margin: '0 0 32px', fontSize: '0.9rem' }}>
          AI will surgically improve your resume — fix weak lines, tighten bullets,
          and integrate your{' '}
          <strong style={{ color: '#f87171' }}>{data.missingSkills?.length || 0} missing skills</strong>
          {' '}naturally — without fabricating experience.
        </p>

        {data.missingSkills?.length > 0 && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 28, maxWidth: 500,
          }}>
            <p style={{ fontSize: '0.8rem', color: '#f87171', margin: '0 0 10px', fontWeight: 600 }}>
              Skills to integrate:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {data.missingSkills.map((s, i) => (
                <span key={i} className="badge badge-red">{s}</span>
              ))}
            </div>
          </div>
        )}

        <button id="generate-resume-btn" onClick={generateResume} className="btn-primary">
          <FileText size={16} /> Generate ATS Resume
        </button>
        {error && <p style={{ color: '#f87171', marginTop: 16, fontSize: '0.85rem' }}>{error}</p>}
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, marginBottom: 20 }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>AI is improving your resume...</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>This may take 15–30 seconds</p>
        <div style={{ width: 280, marginTop: 24 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '100%', animation: 'shimmer 2s infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Result state ───────────────────────────────────────
  const r = optimizedResume;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 3px' }}>ATS-Optimized Resume</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Tailored for <strong style={{ color: 'var(--text-secondary)' }}>{data.jobTitle || 'your role'}</strong>
            {' '}· {data.missingSkills?.length || 0} skills integrated
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* View toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
          }}>
            <button
              onClick={() => setView('improved')}
              style={{
                padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                background: view === 'improved' ? 'rgba(96,165,250,0.15)' : 'transparent',
                color: view === 'improved' ? '#60a5fa' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <Eye size={13} /> Improved
            </button>
            <button
              onClick={() => setView('compare')}
              style={{
                padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                background: view === 'compare' ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: view === 'compare' ? '#a78bfa' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <GitCompare size={13} /> Compare Changes
            </button>
          </div>

          <button onClick={generateResume} className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RotateCcw size={13} /> Regenerate
          </button>

          <button
            id="download-resume-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 18px' }}
          >
            {downloading
              ? <><div className="spinner" />Downloading...</>
              : <><Download size={14} />Download PDF</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: '#f87171',
        }}>
          {error}
        </div>
      )}

      {/* ── Compare legend ─────────────────────────────── */}
      {view === 'compare' && (
        <div style={{
          display: 'flex', gap: 20, padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: 10, fontSize: '0.78rem', flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Legend:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: 3, padding: '1px 6px', fontWeight: 600 }}>word</span>
            <span style={{ color: 'var(--text-secondary)' }}>Added / Improved</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#f87171', textDecoration: 'line-through' }}>word</span>
            <span style={{ color: 'var(--text-secondary)' }}>Removed</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--text-secondary)' }}>word</span>
            <span style={{ color: 'var(--text-secondary)' }}>Unchanged</span>
          </span>
        </div>
      )}

      {/* ── Resume Preview Card ───────────────────────── */}
      <div style={{
        background: '#0f1929',
        border: '1px solid #1e3a5f',
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: 640,
        overflowY: 'auto',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}>

        {/* Name Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
          padding: '30px 36px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {r.name || 'Candidate Name'}
          </h2>
          {data.jobTitle && (
            <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.88rem', fontWeight: 500 }}>
              {data.jobTitle}
            </p>
          )}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {data.missingSkills?.slice(0, 4).map((s, i) => (
              <span key={i} style={{
                fontSize: '0.7rem', background: 'rgba(255,255,255,0.12)', color: '#bfdbfe',
                borderRadius: 20, padding: '2px 10px', border: '1px solid rgba(255,255,255,0.15)',
              }}>{s}</span>
            ))}
            {data.missingSkills?.length > 4 && (
              <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>+{data.missingSkills.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 36px' }}>

          {/* Summary */}
          {r.summary && (
            <ResumeSection icon={<User size={14} />} title="Professional Summary">
              {view === 'compare' ? (
                <p style={{ margin: 0, lineHeight: 1.8 }}>
                  <DiffLine
                    original={extractedText?.match(/summary[:\s]*([\s\S]{30,400}?)(?:\n[A-Z]{2,}|\n\n)/i)?.[1]?.trim() || ''}
                    improved={r.summary}
                  />
                </p>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                  {r.summary}
                </p>
              )}
            </ResumeSection>
          )}

          {/* Skills */}
          {r.skills?.length > 0 && (
            <ResumeSection icon={<Code2 size={14} />} title="Technical Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {r.skills.map((s, i) => (
                  <span key={i} style={{
                    fontSize: '0.78rem', fontWeight: 500,
                    background: 'rgba(96,165,250,0.1)',
                    color: '#93c5fd',
                    border: '1px solid rgba(96,165,250,0.25)',
                    borderRadius: 6, padding: '3px 10px',
                  }}>{s}</span>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* Experience */}
          {r.experience?.length > 0 && (
            <ResumeSection icon={<Briefcase size={14} />} title="Professional Experience">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {r.experience.map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>{exp.role}</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>{exp.duration}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#60a5fa', margin: '0 0 10px', fontStyle: 'italic' }}>{exp.company}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(exp.bullets || []).map((b, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#60a5fa', marginTop: 4, flexShrink: 0, fontSize: 10 }}>&#9679;</span>
                          {view === 'compare' ? (
                            <DiffLine original={bestMatch(b, originalBullets) || ''} improved={b} />
                          ) : (
                            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* Projects */}
          {r.projects?.length > 0 && (
            <ResumeSection icon={<FolderGit2 size={14} />} title="Projects">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {r.projects.map((proj, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>{proj.name}</span>
                      {proj.tech && (
                        <span style={{
                          fontSize: '0.7rem', background: 'rgba(167,139,250,0.12)',
                          color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.25)',
                          borderRadius: 5, padding: '2px 8px', fontStyle: 'italic',
                        }}>{proj.tech}</span>
                      )}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(proj.bullets || []).map((b, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#a78bfa', marginTop: 4, flexShrink: 0, fontSize: 10 }}>&#9679;</span>
                          {view === 'compare' ? (
                            <DiffLine original={bestMatch(b, originalBullets) || ''} improved={b} />
                          ) : (
                            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

        </div>
      </div>

    </div>
  );
};
