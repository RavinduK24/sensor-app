import React, { useState } from 'react';

export default function AboutUs({ onNavigate }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      role: 'AI & Facial Recognition Lead',
      image: '🤖',
      bio: 'PhD in Computer Vision with 10+ years in AI research'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'Real Estate Expert',
      image: '🏠',
      bio: 'Certified real estate agent with 15 years of market experience'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'UX/UI Designer',
      image: '✨',
      bio: 'Award-winning designer specializing in AI-driven interfaces'
    },
    {
      id: 4,
      name: 'James Park',
      role: 'Data Science Engineer',
      image: '📊',
      bio: 'Machine learning specialist focusing on personalization algorithms'
    }
  ];

  return (
    <div className="about-us-page">
      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h1>About VisionHomes AI</h1>
          <p className="mission-statement">
            We're revolutionizing real estate by combining cutting-edge facial recognition AI with personalized property matching to help you find your dream home.
          </p>
          <div className="mission-cards">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To make home hunting effortless, personalized, and intelligent through advanced AI technology.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🔮</div>
              <h3>Our Vision</h3>
              <p>A future where AI understands your needs and presents only properties that truly match your lifestyle.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🛡️</div>
              <h3>Our Values</h3>
              <p>Privacy, transparency, and ethical AI use in all our operations and user interactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-header">
          <h2>Meet Our Team</h2>
          <p>Experts in AI, real estate, and design working together</p>
        </div>

        <div className="team-grid">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className={`team-card ${selectedMember?.id === member.id ? 'active' : ''}`}
              onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
            >
              <div className="team-image">{member.image}</div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              {selectedMember?.id === member.id && (
                <div className="team-bio">{member.bio}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Ethics Section */}
      <section className="ethics-section">
        <h2>AI Ethics & Security</h2>
        <div className="ethics-grid">
          <div className="ethics-card">
            <span className="ethics-icon">🔒</span>
            <h3>Privacy First</h3>
            <p>All facial data is encrypted and deleted after analysis. We never store biometric information.</p>
          </div>
          <div className="ethics-card">
            <span className="ethics-icon">⚖️</span>
            <h3>Fairness</h3>
            <p>Our algorithms are tested for bias and optimized to serve all demographics equally.</p>
          </div>
          <div className="ethics-card">
            <span className="ethics-icon">📖</span>
            <h3>Transparency</h3>
            <p>We're open about how our AI works and provide users full control over their data.</p>
          </div>
          <div className="ethics-card">
            <span className="ethics-icon">👥</span>
            <h3>User Control</h3>
            <p>You can delete your profile and data at any time without questions asked.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat">
          <h2>500K+</h2>
          <p>Happy Users</p>
        </div>
        <div className="stat">
          <h2>50K+</h2>
          <p>Properties Listed</p>
        </div>
        <div className="stat">
          <h2>98%</h2>
          <p>Match Rate</p>
        </div>
        <div className="stat">
          <h2>24/7</h2>
          <p>AI Support</p>
        </div>
      </section>
    </div>
  );
}
