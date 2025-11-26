import React, { useEffect, useState } from 'react';

const ProfileDashboard = ({ customerType, onContinue }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const getProfileContent = (type) => {
    switch (type) {
      case 'Work from Home Adult':
        return {
          title: "Productivity Hub",
          subtitle: "Optimized for Focus & Comfort",
          icon: "💼",
          color: "#3b82f6",
          features: [
            "High-speed connectivity zones",
            "Ergonomic lighting analysis",
            "Noise-canceling acoustic ratings",
            "Dedicated office space filtering"
          ],
          message: "We've curated a selection of properties that maximize your productivity while ensuring work-life balance."
        };
      case 'Elderly People':
        return {
          title: "Golden Years Comfort",
          subtitle: "Safety, Accessibility & Peace",
          icon: "👴",
          color: "#10b981",
          features: [
            "Single-level living options",
            "Enhanced air quality monitoring",
            "Proximity to healthcare",
            "Quiet neighborhood scores"
          ],
          message: "Your comfort and safety are our priority. These homes are selected for ease of access and environmental stability."
        };
      case 'Families with Babies':
        return {
          title: "Family Nurture Zone",
          subtitle: "Safe, Clean & Playful",
          icon: "👶",
          color: "#f59e0b",
          features: [
            "Nursery-ready climate control",
            "Park & school proximity",
            "Low noise pollution",
            "Safety-first environmental checks"
          ],
          message: "Growing families need special care. We've found homes with the perfect environment for your little ones."
        };
      case 'Asthma/Allergic People':
        return {
          title: "Pure Air Sanctuary",
          subtitle: "Health-First Living",
          icon: "😷",
          color: "#8b5cf6",
          features: [
            "Advanced air filtration ratings",
            "Low-allergen landscaping",
            "Humidity control systems",
            "Pollutant-free material checks"
          ],
          message: "Breathe easy. These properties are rigorously screened for air quality and allergen reduction."
        };
      default:
        return {
          title: "Welcome Home",
          subtitle: "Find Your Perfect Match",
          icon: "🏠",
          color: "#6b7280",
          features: [
            "Smart comfort analysis",
            "Lifestyle matching",
            "Real-time sensing",
            "Historical data insights"
          ],
          message: "Explore our listings tailored to your preferences."
        };
    }
  };

  const content = getProfileContent(customerType);

  return (
    <div className="profile-dashboard">
      <div className={`dashboard-card ${animate ? 'slide-up' : ''}`} style={{ borderTop: `5px solid ${content.color}` }}>
        <div className="dashboard-header">
          <div className="dashboard-icon" style={{ backgroundColor: `${content.color}20` }}>
            {content.icon}
          </div>
          <div className="dashboard-title-group">
            <h4>Profile Recognized</h4>
            <h1>{content.title}</h1>
            <p className="dashboard-subtitle">{content.subtitle}</p>
          </div>
        </div>

        <div className="dashboard-body">
          <div className="dashboard-message">
            <p>{content.message}</p>
          </div>

          <div className="dashboard-features">
            <h3>Key Features for You:</h3>
            <ul>
              {content.features.map((feature, index) => (
                <li key={index} style={{ animationDelay: `${index * 0.1}s` }} className={animate ? 'fade-in-right' : ''}>
                  <span style={{ color: content.color }}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="dashboard-actions">
          <button 
            className="btn-primary btn-block" 
            onClick={onContinue}
            style={{ backgroundColor: content.color }}
          >
            View Matched Properties →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
