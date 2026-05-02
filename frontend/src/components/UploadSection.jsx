import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Briefcase, ChevronRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export const UploadSection = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle'); // idle | parsing | analyzing

  const onDrop = useCallback((accepted) => {
    if (accepted?.length > 0) { setFile(accepted[0]); setError(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload a resume (PDF or DOCX).');
    if (!jobDescription.trim()) return setError('Please paste a job description.');

    setIsAnalyzing(true);
    setError(null);
    setStep('parsing');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      setStep('analyzing');
      const response = await axios.post(`${API}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        onAnalysisComplete(response.data.data, response.data.extractedResumeText);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error. Make sure the backend is running on port 5000.');
    } finally {
      setIsAnalyzing(false);
      setStep('idle');
    }
  };

  const stepLabel = step === 'parsing' ? 'Parsing your resume...' : step === 'analyzing' ? 'AI is analyzing match...' : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent-dim)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 99,
          padding: '5px 16px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#a5b4fc',
          letterSpacing: '0.04em',
          marginBottom: 24,
          textTransform: 'uppercase',
        }}>
          ⚡ Powered by Gemini 2.5 Flash
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          margin: '0 0 20px',
        }}>
          Land your dream job with{' '}
          <span className="gradient-text">AI precision</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          Upload your resume, paste the job description — get ATS score, skill gap analysis, an optimized resume, and 15 tailored interview questions.
        </p>
      </div>

      {/* Upload card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Steps indicator */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          padding: '0 0 0 0',
        }}>
          {[
            { n: '1', label: 'Upload Resume', done: !!file },
            { n: '2', label: 'Job Description', done: jobDescription.trim().length > 20 },
            { n: '3', label: 'Analyze', done: false },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 24px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                background: s.done ? 'var(--green)' : 'var(--accent-dim)',
                border: s.done ? 'none' : '1px solid rgba(99,102,241,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: s.done ? '#fff' : '#a5b4fc',
                flexShrink: 0,
                transition: 'all 0.3s',
              }}>
                {s.done ? '✓' : s.n}
              </div>
              <span style={{ fontSize: '0.83rem', fontWeight: 500, color: s.done ? 'var(--green)' : 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="upload-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Upload zone */}
          <div className="upload-zone" style={{ padding: '32px', borderRight: '1px solid var(--border)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
              Resume File
            </label>
            {!file ? (
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? '#6366f1' : 'var(--border-bright)'}`,
                  borderRadius: 14,
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDragActive ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <input {...getInputProps()} />
                <div style={{
                  width: 52,
                  height: 52,
                  background: 'var(--accent-dim)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <UploadCloud size={24} color="#818cf8" />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.95rem' }}>
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  or <span style={{ color: '#818cf8', fontWeight: 600 }}>click to browse</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>PDF or DOCX · Max 5MB</p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: 'var(--green-dim)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <File size={20} color="var(--green)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* JD Input */}
          <div className="jd-zone" style={{ padding: '32px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Briefcase size={13} /> Job Description
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); setError(null); }}
              placeholder="Paste the full job description here...&#10;&#10;e.g. We are looking for a Senior Software Engineer with 3+ years of React experience, proficient in Node.js, AWS, system design..."
              style={{
                width: '100%',
                height: 180,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {jobDescription.trim().length} chars · More detail = better analysis
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.015)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            {isAnalyzing && stepLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <div className="spinner" />
                {stepLabel}
              </div>
            )}
          </div>
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || !jobDescription.trim()}
            className="btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            {isAnalyzing ? (
              <><div className="spinner" /> Analyzing...</>
            ) : (
              <>Analyze My Resume <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: 32,
        flexWrap: 'wrap',
      }}>
        {['🔒 Private & Secure', '⚡ Results in ~10s', '🎯 ATS-Optimized', '📄 PDF Download'].map((t, i) => (
          <span key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t}</span>
        ))}
      </div>
    </div>
  );
};
