import React, { useState } from 'react';

export default function Contact({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send this to backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>Have questions? Our AI-powered support team is here to help 24/7</p>
      </div>

      <div className="contact-main">
        {/* Contact Form */}
        <section className="contact-form-section">
          <h2>Send us a Message</h2>
          {submitted ? (
            <div className="success-message">
              ✓ Message sent successfully! We'll get back to you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject...</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="property">Property Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-contact">
                Send Message
              </button>
            </form>
          )}
        </section>

        {/* Contact Info */}
        <aside className="contact-info-section">
          <h2>Contact Information</h2>

          <div className="contact-info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <h3>Email</h3>
              <p>support@visionhomesai.com</p>
              <p className="info-small">Response time: Under 2 hours</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h3>Phone</h3>
              <p>+1 (800) HOMES-AI</p>
              <p className="info-small">Available 24/7</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h3>Headquarters</h3>
              <p>123 Tech Plaza</p>
              <p>San Francisco, CA 94105</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">🌐</div>
            <div className="info-content">
              <h3>Follow Us</h3>
              <div className="social-links-contact">
                <a href="#" className="social-link-contact">Twitter</a>
                <a href="#" className="social-link-contact">LinkedIn</a>
                <a href="#" className="social-link-contact">Instagram</a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* AI Chatbot Preview */}
      <section className="chatbot-section">
        <h2>Chat with Our AI Assistant</h2>
        <div className="chatbot-preview">
          <div className="chat-messages">
            <div className="chat-message bot">
              <p>👋 Hi! I'm VisionHomes' AI assistant. How can I help you find your perfect home today?</p>
            </div>
            <div className="chat-message user">
              <p>I'm looking for a quiet home near the city</p>
            </div>
            <div className="chat-message bot">
              <p>Perfect! I found 47 properties matching your criteria. Would you like me to show you the top 5 recommendations?</p>
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Type your message..." disabled />
            <button disabled>Send</button>
          </div>
        </div>
      </section>
    </div>
  );
}
