import React, { useState } from 'react';

export default function Footer({ onNavigate }) {
  const [newsletter, setNewsletter] = useState('');
  const [newsSubMessage, setNewsSubMessage] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletter.trim()) {
      setNewsSubMessage('✓ Thanks for subscribing!');
      setNewsletter('');
      setTimeout(() => setNewsSubMessage(''), 3000);
    }
  };

  return (
    <footer className="vh-footer">
      <div className="footer-container">
        {/* Newsletter Section */}
        <section className="footer-newsletter">
          <h3>Stay Updated</h3>
          <p>Get the latest property listings and AI insights delivered to your inbox</p>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="your@email.com"
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="btn-newsletter">
              Subscribe
            </button>
          </form>
          {newsSubMessage && <p className="sub-message">{newsSubMessage}</p>}
        </section>

        {/* Footer Grid */}
        <div className="footer-content">
          {/* Column 1: Company */}
          <div className="footer-column">
            <h4>VisionHomes AI</h4>
            <ul>
              <li><button onClick={() => onNavigate('about')}>About Us</button></li>
              <li><button onClick={() => onNavigate('search')}>Browse Properties</button></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => onNavigate('contact')}>Contact Us</button></li>
              <li><button onClick={() => onNavigate('faq')}>FAQ</button></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="footer-column">
            <h4>Follow Us</h4>
            <div className="footer-social">
              <a href="#" className="footer-social-btn" title="Twitter">𝕏</a>
              <a href="#" className="footer-social-btn" title="LinkedIn">in</a>
              <a href="#" className="footer-social-btn" title="Instagram">📷</a>
              <a href="#" className="footer-social-btn" title="GitHub">⚙️</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; 2025 VisionHomes AI. All rights reserved. Powered by AI & ❤️</p>
          <div className="footer-badges">
            <span className="badge">🔒 Secure</span>
            <span className="badge">🌍 Global</span>
            <span className="badge">⚡ Fast</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
