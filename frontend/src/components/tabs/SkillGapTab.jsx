import { CheckCircle2, XCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

const scoreConfig = (s) => {
  if (s >= 80) return { color: 'var(--green)', bg: 'var(--green-dim)', label: 'Strong Match', ring: '#10b981' };
  if (s >= 60) return { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'Moderate Match', ring: '#f59e0b' };
  return { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Weak Match', ring: '#ef4444' };
};

export const SkillGapTab = ({ data }) => {
  const score = data.matchScore || 0;
  const { color, bg, label, ring } = scoreConfig(score);
  const circumference = 2 * Math.PI * 48;
  const dash = (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Score card */}
      <div className="score-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        background: bg,
        border: `1px solid ${ring}30`,
        borderRadius: 16,
        padding: '28px 32px',
        flexWrap: 'wrap',
      }}>
        {/* SVG ring */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="48"
              fill="none"
              stroke={ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '0.7rem', color, fontWeight: 600 }}>/ 100</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="badge" style={{
            background: bg, color, border: `1px solid ${ring}40`,
            marginBottom: 10,
          }}>
            <TrendingUp size={11} style={{ marginRight: 5 }} />
            {label}
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
            ATS Match Score
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
            {score >= 80
              ? 'Excellent! Your resume strongly matches the job requirements. You have a high chance of passing ATS screening.'
              : score >= 60
              ? 'Good foundation. Fix the missing skills and weak areas to significantly improve your ATS ranking.'
              : 'Your resume needs work to pass ATS filters. Follow the recommendations below and use the AI Resume Builder tab.'}
          </p>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Matching */}
        <div style={{
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: 14,
          padding: '22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckCircle2 size={18} color="var(--green)" />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>
              Matching Skills
              <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>
                ({data.matchingSkills?.length || 0})
              </span>
            </h4>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.matchingSkills?.length > 0
              ? data.matchingSkills.map((s, i) => (
                  <span key={i} className="badge badge-green">{s}</span>
                ))
              : <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>No strong matches found.</span>}
          </div>
        </div>

        {/* Missing */}
        <div style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: 14,
          padding: '22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <XCircle size={18} color="var(--red)" />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>
              Missing Skills
              <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600 }}>
                ({data.missingSkills?.length || 0})
              </span>
            </h4>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.missingSkills?.length > 0
              ? data.missingSkills.map((s, i) => (
                  <span key={i} className="badge badge-red">{s}</span>
                ))
              : <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>No missing skills! Great resume.</span>}
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      {data.weakAreas?.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.04)',
          border: '1px solid rgba(245,158,11,0.18)',
          borderRadius: 14,
          padding: '22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={18} color="var(--amber)" />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>Weak Areas</h4>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.weakAreas.map((area, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, marginTop: 6 }} />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 14,
          padding: '22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Lightbulb size={18} color="#818cf8" />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>
              AI Recommendations
            </h4>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recommendations.map((rec, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#818cf8',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
