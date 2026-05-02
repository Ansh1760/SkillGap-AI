const RESOURCES = [
  {
    id: 'html',
    title: 'HTML',
    emoji: '🌐',
    desc: 'Structure of the web — semantic elements, forms, and accessibility.',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.2)',
    url: 'https://www.geeksforgeeks.org/html-tutorial/',
    level: 'Beginner',
  },
  {
    id: 'css',
    title: 'CSS',
    emoji: '🎨',
    desc: 'Styling and layout — Flexbox, Grid, animations, and responsive design.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    url: 'https://www.geeksforgeeks.org/css-tutorial/',
    level: 'Beginner',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    emoji: '⚡',
    desc: 'Core language — ES6+, async/await, closures, and DOM manipulation.',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.08)',
    border: 'rgba(234,179,8,0.2)',
    url: 'https://www.geeksforgeeks.org/javascript/',
    level: 'Intermediate',
  },
  {
    id: 'dsa',
    title: 'DSA',
    emoji: '🔢',
    desc: 'Arrays, trees, graphs, dynamic programming — crack coding interviews.',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    url: 'https://www.geeksforgeeks.org/data-structures/',
    level: 'Advanced',
  },
  {
    id: 'react',
    title: 'React',
    emoji: '⚛️',
    desc: 'Hooks, state management, performance optimization, and component patterns.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
    url: 'https://www.geeksforgeeks.org/reactjs-tutorials/',
    level: 'Intermediate',
  },
  {
    id: 'nodejs',
    title: 'Node.js',
    emoji: '🟢',
    desc: 'Backend development — Express, REST APIs, middleware, and authentication.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    url: 'https://www.geeksforgeeks.org/nodejs/',
    level: 'Intermediate',
  },
  {
    id: 'system-design',
    title: 'System Design',
    emoji: '🏗️',
    desc: 'Scalability, load balancers, databases, caching, and distributed systems.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    url: 'https://www.geeksforgeeks.org/system-design-tutorial/',
    level: 'Advanced',
  },
  {
    id: 'sql',
    title: 'SQL & Databases',
    emoji: '🗄️',
    desc: 'Joins, indexes, transactions, normalization, and query optimization.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.2)',
    url: 'https://www.geeksforgeeks.org/sql-tutorial/',
    level: 'Intermediate',
  },
];

const LEVEL_COLORS = {
  Beginner: { color: 'var(--green)', bg: 'var(--green-dim)' },
  Intermediate: { color: 'var(--amber)', bg: 'var(--amber-dim)' },
  Advanced: { color: 'var(--red)', bg: 'var(--red-dim)' },
};

export const StudyResources = () => {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 99,
          padding: '5px 16px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#c084fc',
          letterSpacing: '0.04em',
          marginBottom: 20,
          textTransform: 'uppercase',
        }}>
          📚 Curated Learning Paths
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          margin: '0 0 16px',
          lineHeight: 1.1,
        }}>
          Study <span className="gradient-text">Resources</span>
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          maxWidth: 480,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Everything you need to plug your skill gaps. Click any card to start learning on GeeksforGeeks.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 20,
      }}>
        {RESOURCES.map((r) => {
          const levelStyle = LEVEL_COLORS[r.level];
          return (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card card-hover"
              id={`resource-${r.id}`}
              style={{ '--card-accent': r.color }}
            >
              {/* Icon + level */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  background: r.bg,
                  border: `1px solid ${r.border}`,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  transition: 'transform 0.25s',
                }}>
                  {r.emoji}
                </div>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: levelStyle.color,
                  background: levelStyle.bg,
                  border: `1px solid ${levelStyle.color}30`,
                }}>
                  {r.level}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                margin: '0 0 8px',
                color: r.color,
                transition: 'color 0.2s',
              }}>
                {r.title}
              </h3>

              {/* Desc */}
              <p style={{
                fontSize: '0.83rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: '0 0 18px',
              }}>
                {r.desc}
              </p>

              {/* CTA */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: r.color,
              }}>
                Start Learning
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Hover glow line */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${r.color}, transparent)`,
                borderRadius: '0 0 18px 18px',
                opacity: 0,
                transition: 'opacity 0.25s',
              }} className="card-hover-line" />
            </a>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center',
        marginTop: 52,
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          💡 <strong style={{ color: 'var(--text-secondary)' }}>Pro tip:</strong> Focus on your missing skills first. Use the{' '}
          <a href="/" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Dashboard</a>
          {' '}to identify exactly which topics need attention.
        </p>
      </div>
    </div>
  );
};
