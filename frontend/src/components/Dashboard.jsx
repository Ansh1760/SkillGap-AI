import { useState } from 'react';
import { SkillGapTab } from './tabs/SkillGapTab';
import { InterviewTab } from './tabs/InterviewTab';
import { BarChart2, MessageSquare, ArrowLeft } from 'lucide-react';

const TABS = [
  { id: 'gap',       label: 'Skill Gap Analysis', icon: BarChart2 },
  { id: 'interview', label: 'Interview Prep',      icon: MessageSquare },
];

export const Dashboard = ({ data, extractedText, onReset }) => {
  const [activeTab, setActiveTab] = useState('gap');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', margin: 0 }}>
            Your AI Analysis Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '6px 0 0' }}>
            {data.jobTitle ? `Role: ${data.jobTitle}` : 'Resume analyzed successfully'}
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-ghost"
          id="start-over-btn"
        >
          <ArrowLeft size={15} /> Start Over
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 24 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="card"
        style={{ padding: '32px', minHeight: 500, animation: 'fadeInUp 0.3s ease' }}
        key={activeTab}
      >
        {activeTab === 'gap'       && <SkillGapTab data={data} />}
        {activeTab === 'interview' && <InterviewTab data={data} extractedText={extractedText} />}
      </div>
    </div>
  );
};
