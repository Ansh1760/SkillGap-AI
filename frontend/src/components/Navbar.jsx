import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, BookOpen, BrainCircuit, Menu, X, Home, FileEdit } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const navLinks = [
    { path: '/',               label: 'Home',           icon: <Home size={15} /> },
    { path: '/resume-builder', label: 'Resume Builder', icon: <FileEdit size={15} /> },
    { path: '/test',           label: 'Certification',  icon: <BrainCircuit size={15} /> },
    { path: '/resources',      label: 'Study Resources', icon: <BookOpen size={15} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header ref={menuRef} className="nav-header">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span className="nav-logo-text">
            Skill<span style={{ color: '#818cf8' }}>Gap</span> AI
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="nav-desktop">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link${isActive(link.path) ? ' nav-link-active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`nav-mobile-panel${isOpen ? ' nav-mobile-open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={`nav-mobile-link${isActive(link.path) ? ' nav-mobile-link-active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
};
