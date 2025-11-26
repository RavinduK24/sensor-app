import React, { useState } from 'react';

export default function FAQ({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How does facial recognition help me find a home?',
      answer: 'Our AI analyzes your facial features to understand your lifestyle and preferences, then matches you with properties that align with your needs. This goes beyond traditional filtering to provide truly personalized recommendations.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'Is facial recognition technology accurate?',
      answer: 'Yes! Our AI uses state-of-the-art TensorFlow.js models trained on millions of images. It analyzes age, expressions, and other factors to understand your profile with 98% accuracy.'
    },
    {
      id: 3,
      category: 'Privacy & Security',
      question: 'What happens to my facial data after scanning?',
      answer: 'Your facial data is never stored. After analysis, all biometric information is immediately deleted. We only keep your profile preferences to improve recommendations. Full details are in our Privacy Policy.'
    },
    {
      id: 4,
      category: 'Privacy & Security',
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We use 256-bit encryption for all data, comply with GDPR and CCPA regulations, and are regularly audited by third-party security firms.'
    },
    {
      id: 5,
      category: 'Features',
      question: 'Can I update my preferences without rescanning?',
      answer: 'Yes! You can manually adjust your profile preferences, search filters, and preferences at any time in your dashboard without needing to scan again.'
    },
    {
      id: 6,
      category: 'Features',
      question: 'What if I want properties matched to a different profile?',
      answer: 'Simply use the "Re-scan" button on any page to update your profile, or manually select a different profile type from the preferences menu.'
    },
    {
      id: 7,
      category: 'Properties',
      question: 'How are comfort scores calculated?',
      answer: 'Our comfort score algorithm considers factors like air quality, noise levels, temperature stability, lighting, and other environmental sensors in each property to rate living conditions on a scale of 0-100.'
    },
    {
      id: 8,
      category: 'Properties',
      question: 'Can I see properties outside my personalized recommendations?',
      answer: 'Absolutely! Use the Advanced Search feature to browse all available properties with custom filters for location, price, size, and more.'
    },
    {
      id: 9,
      category: 'Support',
      question: 'How do I contact customer support?',
      answer: 'You can reach our 24/7 support team via email (support@visionhomesai.com), phone (+1-800-HOMES-AI), or live chat on this site. We typically respond within 2 hours.'
    },
    {
      id: 10,
      category: 'Support',
      question: 'What should I do if there\'s a technical issue?',
      answer: 'Try clearing your browser cache, disabling ad blockers, and ensuring you have webcam permissions enabled. If problems persist, contact our support team with your browser and device information.'
    }
  ];

  const categories = ['All', ...new Set(faqs.map(f => f.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about VisionHomes AI</p>
      </div>

      {/* Category Filter */}
      <div className="faq-categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(category);
              setActiveIndex(null);
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="faq-container">
        {filteredFaqs.length === 0 ? (
          <div className="empty-faq">
            <p>No FAQs found for this category.</p>
          </div>
        ) : (
          <div className="faq-list">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="faq-number">{faq.id}</span>
                  <span className="faq-text">{faq.question}</span>
                  <span className="faq-toggle">
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </button>
                {activeIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Still Have Questions */}
      <section className="faq-cta">
        <h2>Still have questions?</h2>
        <p>Our AI support team is available 24/7 to help you</p>
        <div className="cta-buttons">
          <button className="btn-contact-faq" onClick={() => onNavigate('contact')}>
            Contact Support
          </button>
          <button className="btn-chat-faq">
            💬 Start Live Chat
          </button>
        </div>
      </section>
    </div>
  );
}
