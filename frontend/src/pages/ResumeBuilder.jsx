import { useState, useRef } from 'react';
import { User, GraduationCap, Code2, FolderGit2, Briefcase, Trophy, Download, Plus, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { ResumePreview, generatePDF } from './ResumePreview';

const STEPS = [
  { id: 'personal',     label: 'Personal',     icon: User },
  { id: 'skills',       label: 'Skills',        icon: Code2 },
  { id: 'experience',   label: 'Experience',    icon: Briefcase },
  { id: 'projects',     label: 'Projects',      icon: FolderGit2 },
  { id: 'achievements', label: 'Achievements',  icon: Trophy },
  { id: 'education',    label: 'Education',     icon: GraduationCap },
];

const emptyEdu = { degree: '', institution: '', year: '', gpa: '' };
const emptyProj = { name: '', tech: '', link: '', bullets: '' };
const emptyExp = { role: '', company: '', location: '', duration: '', bullets: '' };
const emptyAch = { text: '' };

const iS = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const L = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</label>
);

const Card = ({ children, onRemove, showRemove }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, position: 'relative' }}>
    {showRemove && <button onClick={onRemove} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>}
    {children}
  </div>
);

const Hint = ({ text }) => (
  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0', fontStyle: 'italic' }}>{text}</p>
);

export const ResumeBuilder = () => {
  const [step, setStep] = useState(0);
  const previewRef = useRef(null);

  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' });
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState([{ ...emptyEdu }]);
  const [projects, setProjects] = useState([{ ...emptyProj }]);
  const [experience, setExperience] = useState([{ ...emptyExp }]);
  const [achievements, setAchievements] = useState([{ ...emptyAch }]);

  const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);

  const upd = (setter) => (idx, field, val) => setter(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  const add = (setter, empty) => () => setter(prev => [...prev, { ...empty }]);
  const rm = (setter) => (idx) => setter(prev => prev.filter((_, i) => i !== idx));

  const handleDownload = () => generatePDF({ personal, education, skillsArr, projects, experience, achievements });

  const completionCount = [
    personal.name && personal.email,
    skillsArr.length > 0,
    experience.some(e => e.role),
    projects.some(p => p.name),
    achievements.some(a => a.text),
    education.some(e => e.degree),
  ].filter(Boolean).length;

  const renderForm = () => {
    const s = STEPS[step].id;

    if (s === 'personal') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><L>Full Name *</L><input style={iS} value={personal.name} onChange={e => setPersonal({ ...personal, name: e.target.value })} placeholder="Ansh Tripathi" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><L>Email *</L><input style={iS} value={personal.email} onChange={e => setPersonal({ ...personal, email: e.target.value })} placeholder="ansh@example.com" /></div>
          <div><L>Phone</L><input style={iS} value={personal.phone} onChange={e => setPersonal({ ...personal, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><L>Location</L><input style={iS} value={personal.location} onChange={e => setPersonal({ ...personal, location: e.target.value })} placeholder="Lucknow, India" /></div>
          <div><L>LinkedIn</L><input style={iS} value={personal.linkedin} onChange={e => setPersonal({ ...personal, linkedin: e.target.value })} placeholder="linkedin.com/in/ansh" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><L>GitHub</L><input style={iS} value={personal.github} onChange={e => setPersonal({ ...personal, github: e.target.value })} placeholder="github.com/ansh" /></div>
          <div><L>Portfolio</L><input style={iS} value={personal.portfolio} onChange={e => setPersonal({ ...personal, portfolio: e.target.value })} placeholder="ansh.dev" /></div>
        </div>
        <div>
          <L>Professional Summary</L>
          <textarea style={{ ...iS, height: 90, resize: 'vertical' }} value={personal.summary} onChange={e => setPersonal({ ...personal, summary: e.target.value })} placeholder="Passionate Full-Stack Developer with 2+ years of experience building scalable web applications using React, Node.js, and AWS..." />
          <Hint text="2-3 sentences. Start with your title, mention years of experience, key technologies, and impact." />
        </div>
      </div>
    );

    if (s === 'skills') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <L>Technical Skills (comma-separated)</L>
          <textarea style={{ ...iS, height: 130, resize: 'vertical' }} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Languages: JavaScript, Python, TypeScript, Java&#10;Frontend: React, Next.js, HTML5, CSS3&#10;Backend: Node.js, Express, Django&#10;Database: MongoDB, PostgreSQL, Redis&#10;DevOps: Docker, AWS, CI/CD, Git" />
          <Hint text="Group by category for better readability. E.g. Languages: X, Y | Frontend: A, B" />
        </div>
        {skillsArr.length > 0 && (
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{skillsArr.length} skills added:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skillsArr.map((s, i) => (
                <span key={i} style={{ fontSize: '0.76rem', fontWeight: 500, background: 'rgba(96,165,250,0.1)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 6, padding: '3px 10px' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    if (s === 'experience') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {experience.map((exp, i) => (
          <Card key={i} showRemove={experience.length > 1} onRemove={() => rm(setExperience)(i)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><L>Job Title *</L><input style={iS} value={exp.role} onChange={e => upd(setExperience)(i, 'role', e.target.value)} placeholder="Software Engineer" /></div>
              <div><L>Company *</L><input style={iS} value={exp.company} onChange={e => upd(setExperience)(i, 'company', e.target.value)} placeholder="Google" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
              <div><L>Duration</L><input style={iS} value={exp.duration} onChange={e => upd(setExperience)(i, 'duration', e.target.value)} placeholder="Jun 2023 – Present" /></div>
              <div><L>Location</L><input style={iS} value={exp.location} onChange={e => upd(setExperience)(i, 'location', e.target.value)} placeholder="Bangalore, India" /></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <L>Key Achievements (one per line)</L>
              <textarea style={{ ...iS, height: 90, resize: 'vertical' }} value={exp.bullets} onChange={e => upd(setExperience)(i, 'bullets', e.target.value)} placeholder="Built real-time notification system serving 10K+ users&#10;Reduced API response time by 40% through query optimization&#10;Led migration from REST to GraphQL, improving data fetching efficiency" />
              <Hint text="Start each line with a strong action verb: Built, Designed, Implemented, Reduced, Led..." />
            </div>
          </Card>
        ))}
        <button onClick={add(setExperience, emptyExp)} className="btn-ghost" style={{ alignSelf: 'flex-start' }}><Plus size={14} /> Add Experience</button>
      </div>
    );

    if (s === 'projects') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {projects.map((proj, i) => (
          <Card key={i} showRemove={projects.length > 1} onRemove={() => rm(setProjects)(i)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><L>Project Name *</L><input style={iS} value={proj.name} onChange={e => upd(setProjects)(i, 'name', e.target.value)} placeholder="SkillGap AI" /></div>
              <div><L>Tech Stack</L><input style={iS} value={proj.tech} onChange={e => upd(setProjects)(i, 'tech', e.target.value)} placeholder="React, Node.js, Gemini API" /></div>
            </div>
            <div style={{ marginTop: 10 }}><L>Live Link / GitHub</L><input style={iS} value={proj.link} onChange={e => upd(setProjects)(i, 'link', e.target.value)} placeholder="github.com/ansh/skillgap-ai" /></div>
            <div style={{ marginTop: 10 }}>
              <L>Key Features & Impact (one per line)</L>
              <textarea style={{ ...iS, height: 80, resize: 'vertical' }} value={proj.bullets} onChange={e => upd(setProjects)(i, 'bullets', e.target.value)} placeholder="Designed ATS scoring engine analyzing resumes against job descriptions&#10;Implemented AI interview prep generating 20+ tailored questions&#10;Built real-time resume builder with live preview and PDF export" />
              <Hint text="Focus on what you built, technologies used, and measurable impact." />
            </div>
          </Card>
        ))}
        <button onClick={add(setProjects, emptyProj)} className="btn-ghost" style={{ alignSelf: 'flex-start' }}><Plus size={14} /> Add Project</button>
      </div>
    );

    if (s === 'achievements') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: '0.82rem', color: '#fbbf24', margin: 0, fontWeight: 600 }}>💡 What to include</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.6 }}>
            Certifications (AWS, Google Cloud), coding achievements (LeetCode 500+, CodeForces Expert), academic honors (Dean's List, scholarship), hackathon wins, publications, open-source contributions.
          </p>
        </div>
        {achievements.map((ach, i) => (
          <Card key={i} showRemove={achievements.length > 1} onRemove={() => rm(setAchievements)(i)}>
            <L>Achievement / Certification</L>
            <input style={iS} value={ach.text} onChange={e => upd(setAchievements)(i, 'text', e.target.value)} placeholder="AWS Certified Solutions Architect — Amazon Web Services (2024)" />
          </Card>
        ))}
        <button onClick={add(setAchievements, emptyAch)} className="btn-ghost" style={{ alignSelf: 'flex-start' }}><Plus size={14} /> Add Achievement</button>
      </div>
    );

    if (s === 'education') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {education.map((edu, i) => (
          <Card key={i} showRemove={education.length > 1} onRemove={() => rm(setEducation)(i)}>
            <div><L>Degree *</L><input style={iS} value={edu.degree} onChange={e => upd(setEducation)(i, 'degree', e.target.value)} placeholder="B.Tech in Computer Science & Engineering" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginTop: 10 }}>
              <div><L>Institution</L><input style={iS} value={edu.institution} onChange={e => upd(setEducation)(i, 'institution', e.target.value)} placeholder="BBDU, Lucknow" /></div>
              <div><L>Year</L><input style={iS} value={edu.year} onChange={e => upd(setEducation)(i, 'year', e.target.value)} placeholder="2021 – 2025" /></div>
              <div><L>GPA / %</L><input style={iS} value={edu.gpa} onChange={e => upd(setEducation)(i, 'gpa', e.target.value)} placeholder="8.5 / 10" /></div>
            </div>
          </Card>
        ))}
        <button onClick={add(setEducation, emptyEdu)} className="btn-ghost" style={{ alignSelf: 'flex-start' }}><Plus size={14} /> Add Education</button>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
      {/* LEFT: Form */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Resume Builder</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completionCount}/6 sections</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 20px' }}>Build your professional, ATS-friendly resume</p>

        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${(completionCount / 6) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 22, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setStep(i)} style={{
                flex: 1, minWidth: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '9px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: i === step ? 'var(--accent-dim)' : 'transparent',
                color: i === step ? '#818cf8' : 'var(--text-muted)',
                fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s',
              }}>
                <Icon size={13} />
                <span className="hide-mobile">{s.label}</span>
              </button>
            );
          })}
        </div>

        {renderForm()}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, gap: 12 }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost">
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleDownload} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
              <Download size={14} /> PDF
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleDownload} className="btn-primary" style={{ background: 'linear-gradient(135deg, #065f46, #10b981)' }}>
                <Download size={16} /> Download Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 90 }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Live Preview</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>ATS-Friendly</span>
          </div>
          <button onClick={handleDownload} className="btn-primary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
            <Download size={13} /> Download PDF
          </button>
        </div>
        <ResumePreview ref={previewRef} personal={personal} education={education} skillsArr={skillsArr} projects={projects} experience={experience} achievements={achievements} />
      </div>
    </div>
  );
};
