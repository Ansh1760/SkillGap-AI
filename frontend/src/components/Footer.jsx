import { Link } from 'react-router-dom';
import { Zap, Mail, MapPin, Camera } from 'lucide-react';

export const Footer = () => {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: 'Resume Analysis', to: '/' },
    { label: 'Certification',   to: '/test' },
    { label: 'Study Resources',  to: '/resources' },
  ];

  const socials = [
    {
      Icon: Mail,
      href: 'mailto:tripathiansh1760@gmail.com',
      label: 'tripathiansh1760@gmail.com',
      ariaLabel: 'Email',
    },
    {
      Icon: Camera,
      href: 'https://instagram.com/ansh.jsx',
      label: '@ansh.jsx',
      ariaLabel: 'Instagram',
    },
    {
      // LinkedIn uses its own simple SVG because lucide doesn't have a LinkedIn icon
      Icon: (props) => (
        <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM6.902 20.452H3.771V9h3.131v11.452z"/>
        </svg>
      ),
      href: 'https://linkedin.com/in/infoashwini',
      label: 'infoashwini',
      ariaLabel: 'LinkedIn',
    },
    {
      Icon: MapPin,
      href: null,
      label: 'Lucknow, India',
      ariaLabel: 'Location',
    },
  ];

  return (
    <footer className="site-footer">
      {/* ── Main grid ─────────────────────────────────── */}
      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span className="footer-logo-text">
              Skill<span style={{ color: '#818cf8' }}>Gap</span> AI
            </span>
          </Link>
          <p className="footer-tagline">
            The AI-powered interview preparation platform. Analyze resumes, find skill gaps, and land your dream job faster.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-link-list">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="footer-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Socials */}
        <div className="footer-section">
          <h4 className="footer-heading">Connect</h4>
          <ul className="footer-contact-list">
            {socials.map((s, i) => {
              const Tag = s.href ? 'a' : 'span';
              const linkProps = s.href
                ? { href: s.href, target: '_blank', rel: 'noopener noreferrer' }
                : {};
              return (
                <li key={i}>
                  <Tag {...linkProps} className="footer-contact-item" aria-label={s.ariaLabel}>
                    <span className="footer-contact-icon"><s.Icon size={15} /></span>
                    <span className="footer-contact-label">{s.label}</span>
                  </Tag>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className="footer-bottom">
        <p>&copy; {year} SkillGap AI. All rights reserved.</p>
        <p>
          Built by <strong style={{ color: 'var(--text-secondary)' }}>Ashwini Tripathi</strong>
          {' '}&middot; Powered by Gemini 2.5 Flash
        </p>
      </div>
    </footer>
  );
};
