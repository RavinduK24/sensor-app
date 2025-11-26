import React, { useEffect, useState } from 'react';

const WelcomePage = ({ onEnter, onUseCameraRecognition }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="vision-homes-ai">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="grid-bg"></div>
      </div>

      {/* Hero Section */}
      <section className="vh-hero">
        <div className="hero-content">
          <div className="hero-label">Welcome to VisionHomes AI</div>
          <h1 className="vh-title">
            Find Your Dream Home<br/>
            <span className="ai-accent">with AI</span>
          </h1>
          <p className="vh-subtitle">Intelligent facial recognition meets personalized real estate matching</p>
          
          <button className="btn-scan-face" onClick={onUseCameraRecognition}>
            <span className="btn-glow"></span>
            <span className="btn-text">🔍 Scan Face to Begin</span>
          </button>

          <p className="secondary-cta">or <button className="link-btn" onClick={onEnter}>browse all properties</button></p>
        </div>

        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-icon">🏠</div>
            <div className="card-text">Smart Matching</div>
          </div>
        </div>
      </section>

      {/* Facial Recognition Section */}
      <section className="vh-section facial-recognition">
        <div className="section-content">
          <div className="section-label">Secure Facial Recognition</div>
          <h2>We Understand Your Needs</h2>
          <p className="section-description">Our advanced AI analyzes your profile to present perfectly matched properties tailored to your lifestyle.</p>

          <div className="recognition-grid">
            <div className="recognition-card">
              <div className="card-header">
                <div className="card-icon-circle">
                  <span>👤</span>
                </div>
              </div>
              <h3>Profile Recognition</h3>
              <p>Instant identification of your unique preferences and lifestyle requirements</p>
            </div>

            <div className="recognition-card">
              <div className="card-header">
                <div className="card-icon-circle">
                  <span>🔒</span>
                </div>
              </div>
              <h3>100% Secure</h3>
              <p>Your data is encrypted and never shared. Privacy is our top priority.</p>
            </div>

            <div className="recognition-card">
              <div className="card-header">
                <div className="card-icon-circle">
                  <span>⚡</span>
                </div>
              </div>
              <h3>Instant Results</h3>
              <p>Get personalized property recommendations in seconds</p>
            </div>
          </div>

          <div className="camera-placeholder">
            <div className="camera-frame">
              <div className="camera-inner">
                <span className="camera-icon">📷</span>
                <p>Camera Feed Placeholder</p>
                <span className="small-text">Facial recognition activates here</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="vh-section top-picks">
        <div className="section-content">
          <div className="section-label">Curated for You</div>
          <h2>Your Top Picks</h2>
          <p className="section-description">Handpicked properties that match your lifestyle perfectly</p>

          <div className="properties-showcase">
            <div className="property-card">
              <div className="property-image">
                <div className="image-placeholder">
                  <span>🏡</span>
                </div>
              </div>
              <div className="property-info">
                <h3>Modern Downtown Loft</h3>
                <p className="price">$2,500/month</p>
                <p className="location">📍 Downtown District</p>
                <div className="property-features">
                  <span>✓ WiFi</span>
                  <span>✓ Quiet</span>
                  <span>✓ Bright</span>
                </div>
                <button className="btn-property">View Details</button>
              </div>
            </div>

            <div className="property-card">
              <div className="property-image">
                <div className="image-placeholder">
                  <span>🏠</span>
                </div>
              </div>
              <div className="property-info">
                <h3>Family Home with Garden</h3>
                <p className="price">$3,200/month</p>
                <p className="location">📍 Suburban Area</p>
                <div className="property-features">
                  <span>✓ Safe</span>
                  <span>✓ Schools</span>
                  <span>✓ Spacious</span>
                </div>
                <button className="btn-property">View Details</button>
              </div>
            </div>

            <div className="property-card">
              <div className="property-image">
                <div className="image-placeholder">
                  <span>🏘️</span>
                </div>
              </div>
              <div className="property-info">
                <h3>Quiet Apartment Complex</h3>
                <p className="price">$1,800/month</p>
                <p className="location">📍 Residential Zone</p>
                <div className="property-features">
                  <span>✓ Peaceful</span>
                  <span>✓ Accessible</span>
                  <span>✓ Well-lit</span>
                </div>
                <button className="btn-property">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="vh-section ai-features">
        <div className="section-content">
          <div className="section-label">Powered by AI</div>
          <h2>Advanced Technology</h2>

          <div className="features-grid-modern">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <h3>Real-time Sensing</h3>
              <p>24/7 environmental monitoring: temperature, humidity, air quality</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">02</div>
              <h3>Machine Learning</h3>
              <p>Algorithms adapt to your preferences over time</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">03</div>
              <h3>Smart Matching</h3>
              <p>Properties selected based on your unique lifestyle profile</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">04</div>
              <h3>Historical Data</h3>
              <p>24-hour and monthly trends to understand property performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="vh-section contact-section">
        <div className="section-content">
          <div className="contact-container">
            <div className="contact-form-box">
              <h2>Get in Touch</h2>
              <form className="contact-form">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <textarea placeholder="Your Message..." rows="4" required></textarea>
                <button type="submit" className="btn-submit">Send Message</button>
              </form>
            </div>

            <div className="contact-info">
              <h3>VisionHomes AI</h3>
              <p>Your intelligent real estate companion</p>
              
              <div className="info-item">
                <span>📧</span>
                <p>contact@visionhomes.ai</p>
              </div>
              <div className="info-item">
                <span>📱</span>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="info-item">
                <span>📍</span>
                <p>Tech District, Innovation City</p>
              </div>

              <div className="social-links">
                <a href="#" className="social-btn">f</a>
                <a href="#" className="social-btn">𝕏</a>
                <a href="#" className="social-btn">in</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="vh-footer">
        <p>&copy; 2025 VisionHomes AI. All rights reserved. | Secure. Smart. Simple.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
