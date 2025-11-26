import React, { useState, useEffect } from 'react';

export default function Navigation({ currentPage, onNavigate, hasUserProfile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', page: 'welcome' },
    { id: 'search', label: 'Search Properties', page: 'search' },
    { id: 'about', label: 'About Us', page: 'about' },
    { id: 'faq', label: 'FAQ', page: 'faq' },
    { id: 'contact', label: 'Contact', page: 'contact' }
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo" onClick={() => onNavigate('welcome')}>
            <span className="logo-icon">🏠</span>
            <span className="logo-text">VisionHomes AI</span>
          </div>

          {/* Desktop Menu */}
          <div className="nav-menu">
            {navLinks.map(link => (
              <button
                key={link.id}
                className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
                onClick={() => onNavigate(link.page)}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="btn-nav-scan"
            onClick={() => onNavigate('camera')}
          >
            <span className="scan-icon">🔍</span>
            Scan Face to Begin
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <button
              key={link.id}
              className={`mobile-menu-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => {
                onNavigate(link.page);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            className="mobile-btn-scan"
            onClick={() => {
              onNavigate('camera');
              setIsMenuOpen(false);
            }}
          >
            🔍 Scan Face to Begin
          </button>
        </div>
      )}
    </>
  );
}
