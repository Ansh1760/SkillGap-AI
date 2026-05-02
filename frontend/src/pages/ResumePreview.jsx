import { forwardRef } from 'react';
import jsPDF from 'jspdf';

// ── Section heading (dark preview) ──────────────────────────
const PreviewSection = ({ title }) => (
  <div style={{ marginTop: 16 }}>
    <p style={{
      fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      borderBottom: '1px solid #334155', paddingBottom: 3, marginBottom: 8,
    }}>{title}</p>
  </div>
);

// ── Live Preview (dark theme) ────────────────────────────────
export const ResumePreview = forwardRef(
  ({ personal, education, skillsArr, projects, experience, achievements }, ref) => (
    <div ref={ref} style={{
      padding: '24px 28px', background: '#0f1929',
      minHeight: 500, maxHeight: 720, overflowY: 'auto', fontFamily: 'Georgia, serif',
    }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 14, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', margin: '0 0 2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {personal.name || 'Your Name'}
        </h2>
        {personal.summary && (
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '4px 0', fontStyle: 'italic', lineHeight: 1.5 }}>
            {personal.summary.split(/[.!?]/)[0].trim()}
          </p>
        )}
        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).join('  |  ')}
        </p>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <p style={{ fontSize: '0.7rem', color: '#60a5fa', margin: '2px 0 0', fontWeight: 600 }}>
            {[personal.linkedin && 'LinkedIn', personal.github && 'GitHub', personal.portfolio].filter(Boolean).join('  |  ')}
          </p>
        )}
      </div>

      {/* EDUCATION */}
      {education.some(e => e.degree || e.institution) && (
        <>
          <PreviewSection title="Education" />
          {education.map((e, i) => (e.degree || e.institution) && (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0' }}>{e.institution}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{e.year}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{e.degree}</span>
                {e.gpa && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>{e.gpa}</span>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* EXPERIENCE */}
      {experience.some(e => e.role || e.company) && (
        <>
          <PreviewSection title="Experience" />
          {experience.map((e, i) => (e.role || e.company) && (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0' }}>
                  {[e.role, e.company].filter(Boolean).join(' | ')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {[e.location, e.duration].filter(Boolean).join(' | ')}
                </span>
              </div>
              {e.bullets && e.bullets.split('\n').filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 2 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 1 }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>{b.replace(/^[-•]\s*/, '')}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* SKILLS */}
      {skillsArr.length > 0 && (
        <>
          <PreviewSection title="Skills" />
          {skillsArr.map((line, i) => {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
              const label = line.substring(0, colonIdx).trim();
              const vals = line.substring(colonIdx + 1).trim();
              return (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#cbd5e1', minWidth: 110 }}>{label}:</span>
                  <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{vals}</span>
                </div>
              );
            }
            return <p key={i} style={{ fontSize: '0.73rem', color: '#94a3b8', margin: '0 0 2px' }}>{line}</p>;
          })}
        </>
      )}

      {/* PROJECTS */}
      {projects.some(p => p.name) && (
        <>
          <PreviewSection title="Projects / Open-Source" />
          {projects.map((p, i) => p.name && (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0' }}>
                  {p.name}{p.link ? ' | Link' : ''}
                </span>
                {p.tech && <span style={{ fontSize: '0.68rem', color: '#a78bfa', fontStyle: 'italic' }}>Tech Used: {p.tech}</span>}
              </div>
              {p.bullets && p.bullets.split('\n').filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 2 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 1 }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>{b.replace(/^[-•]\s*/, '')}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* CERTIFICATIONS */}
      {achievements.some(a => a.text) && (
        <>
          <PreviewSection title="Certifications" />
          {achievements.map((a, i) => a.text && (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 1 }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a.text}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
);

// ── PDF Generation (direct download via jsPDF — no print dialog) ──
export const generatePDF = ({ personal, education, skillsArr, projects, experience, achievements }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PW = 210; // A4 width mm
  const ML = 18;  // margin left
  const MR = 18;  // margin right
  const TW = PW - ML - MR; // text width
  const MT = 18;  // margin top
  let y = MT;

  const NL = 5;   // normal line height
  const SL = 4.5; // small line height

  const safe = (s) => (s || '').replace(/[^\x00-\x7F]/g, '?'); // strip non-ASCII for jsPDF

  const checkPage = (needed = 8) => {
    if (y + needed > 275) { doc.addPage(); y = MT; }
  };

  // ── Section heading ──
  const sectionHead = (title) => {
    checkPage(10);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), ML, y);
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.4);
    doc.line(ML, y + 1, ML + TW, y + 1);
    y += 5;
  };

  // ── Bullet line (wrapped) ──
  const bulletLines = (text) => {
    if (!text) return;
    text.split('\n').filter(l => l.trim()).forEach(line => {
      const clean = safe(line.replace(/^[-•]\s*/, '').trim());
      const wrapped = doc.splitTextToSize('• ' + clean, TW - 4);
      wrapped.forEach((wl, wi) => {
        checkPage(SL + 1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text(wi === 0 ? wl : '  ' + wl.trim(), ML + 2, y);
        y += SL;
      });
    });
  };

  // ── Row: left bold + right normal ──
  const entryRow = (left, right, bold = true) => {
    checkPage(NL);
    if (bold) doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(safe(left), ML, y);
    if (right) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(safe(right), ML + TW, y, { align: 'right' });
    }
    y += NL;
  };

  const subRow = (left, right) => {
    checkPage(SL + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(safe(left), ML, y);
    if (right) {
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(safe(right), ML + TW, y, { align: 'right' });
    }
    y += SL;
  };

  // ══════════════════════════════════
  // HEADER
  // ══════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(10, 10, 10);
  const name = safe(personal.name || 'Your Name').toUpperCase();
  doc.text(name, PW / 2, y, { align: 'center' });
  y += 6;

  // Job title (first sentence of summary)
  if (personal.summary) {
    const title = personal.summary.split(/[.!?]/)[0].trim();
    if (title.length < 70) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 80);
      doc.text(safe(title), PW / 2, y, { align: 'center' });
      y += 5;
    }
  }

  // Contact line
  const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
  if (contactParts.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(safe(contactParts.join('  |  ')), PW / 2, y, { align: 'center' });
    y += 4.5;
  }

  // Links line
  const linkParts = [
    personal.linkedin && 'LinkedIn',
    personal.github && 'GitHub',
    personal.portfolio,
  ].filter(Boolean);
  if (linkParts.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 86, 160);
    doc.text(safe(linkParts.join('  |  ')), PW / 2, y, { align: 'center' });
    y += 4.5;
  }

  // Header underline
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + TW, y);
  y += 3;

  // ══════════════════════════════════
  // EDUCATION
  // ══════════════════════════════════
  if (education.some(e => e.degree || e.institution)) {
    sectionHead('Education');
    education.forEach(e => {
      if (!e.degree && !e.institution) return;
      entryRow(e.institution, e.year);
      subRow(e.degree, e.gpa ? `${e.gpa}` : '');
      y += 1;
    });
  }

  // ══════════════════════════════════
  // EXPERIENCE
  // ══════════════════════════════════
  if (experience.some(e => e.role || e.company)) {
    sectionHead('Experience');
    experience.forEach(e => {
      if (!e.role && !e.company) return;
      const left = [e.role, e.company].filter(Boolean).join(' | ');
      const right = [e.location, e.duration].filter(Boolean).join(' | ');
      entryRow(left, right);
      bulletLines(e.bullets);
      y += 2;
    });
  }

  // ══════════════════════════════════
  // SKILLS
  // ══════════════════════════════════
  if (skillsArr.length) {
    sectionHead('Skills');
    skillsArr.forEach(line => {
      const colonIdx = line.indexOf(':');
      checkPage(SL + 1);
      if (colonIdx > 0) {
        const label = line.substring(0, colonIdx).trim();
        const vals = line.substring(colonIdx + 1).trim();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(safe(label) + ':', ML, y);
        const labelW = doc.getTextWidth(safe(label) + ':') + 3;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const wrapped = doc.splitTextToSize(safe(vals), TW - labelW);
        doc.text(wrapped[0] || '', ML + labelW, y);
        y += SL;
        for (let i = 1; i < wrapped.length; i++) {
          checkPage(SL);
          doc.text(wrapped[i], ML + labelW, y);
          y += SL;
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(safe(line), ML, y);
        y += SL;
      }
    });
  }

  // ══════════════════════════════════
  // PROJECTS
  // ══════════════════════════════════
  if (projects.some(p => p.name)) {
    sectionHead('Projects / Open-Source');
    projects.forEach(p => {
      if (!p.name) return;
      const projLeft = safe(p.name) + (p.link ? ' | Link' : '');
      const projRight = p.tech ? `Tech Used: ${safe(p.tech)}` : '';
      checkPage(NL);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text(projLeft, ML, y);
      if (projRight) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(projRight, ML + TW, y, { align: 'right' });
      }
      y += NL;
      bulletLines(p.bullets);
      y += 2;
    });
  }

  // ══════════════════════════════════
  // CERTIFICATIONS
  // ══════════════════════════════════
  if (achievements.some(a => a.text)) {
    sectionHead('Certifications');
    achievements.forEach(a => {
      if (!a.text) return;
      checkPage(SL + 1);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const wrapped = doc.splitTextToSize('• ' + safe(a.text), TW - 2);
      wrapped.forEach((wl, wi) => {
        doc.text(wi === 0 ? wl : '  ' + wl.trim(), ML + 2, y);
        y += SL;
      });
    });
  }

  // ── Save directly as file ──
  const filename = (personal.name || 'Resume').replace(/\s+/g, '_') + '_Resume.pdf';
  doc.save(filename);
};
