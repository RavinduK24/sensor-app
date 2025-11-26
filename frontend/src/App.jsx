import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import CameraRecognition from './components/CameraRecognition';
import ProfileDashboard from './components/ProfileDashboard';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import PropertySearch from './components/PropertySearch';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import { getProperties } from './api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome'); // 'welcome', 'camera', 'dashboard', 'properties', 'search', 'about', 'contact', 'faq'
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [customerType, setCustomerType] = useState('Work from Home Adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProperties(customerType);
      
      // Ensure properties are sorted by comfort score (descending)
      data.sort((a, b) => (b.overall_comfort_score || 0) - (a.overall_comfort_score || 0));
      
      setProperties(data);

      // Always highlight the top-ranked property for the active profile
      if (data.length > 0) {
        setSelectedProperty(data[0]);
      } else {
        setSelectedProperty(null);
      }
    } catch (err) {
      setError('Failed to load properties. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'properties') {
      loadProperties();
    }
  }, [customerType, currentPage]);

  const handleCustomerTypeChange = (newType) => {
    setCustomerType(newType);
  };

  const handleEnterSite = () => {
    setCurrentPage('properties');
  };

  const handleUseCameraRecognition = () => {
    setCurrentPage('camera');
  };

  const handleRecognitionComplete = (recognizedType) => {
    setCustomerType(recognizedType);
    setCurrentPage('dashboard');
  };

  const handleDashboardContinue = () => {
    setCurrentPage('properties');
  };

  const handleSkipCamera = () => {
    setCurrentPage('welcome');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
    setSelectedProperty(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setCurrentPage('properties');
  };

  // Main page rendering
  const renderPage = () => {
    // Pages with Navigation and Footer
    const pagesWithNav = ['welcome', 'search', 'about', 'contact', 'faq'];

    // Pages without Navigation (full screen)
    if (currentPage === 'camera') {
      return (
        <div className="app">
          <CameraRecognition
            onRecognitionComplete={handleRecognitionComplete}
            onSkip={handleSkipCamera}
          />
        </div>
      );
    }

    if (currentPage === 'dashboard') {
      return (
        <div className="app">
          <ProfileDashboard
            customerType={customerType}
            onContinue={handleDashboardContinue}
          />
        </div>
      );
    }

    // Pages with Navigation
    if (pagesWithNav.includes(currentPage)) {
      return (
        <div className="app app-with-nav">
          <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
          <main className="page-content">
            {currentPage === 'welcome' && (
              <WelcomePage 
                onEnter={handleEnterSite}
                onUseCameraRecognition={handleUseCameraRecognition}
              />
            )}
            {currentPage === 'search' && (
              <PropertySearch 
                onSelectProperty={handleSelectProperty}
                onBack={() => handleNavigate('welcome')}
              />
            )}
            {currentPage === 'about' && (
              <AboutUs onNavigate={handleNavigate} />
            )}
            {currentPage === 'contact' && (
              <Contact onNavigate={handleNavigate} />
            )}
            {currentPage === 'faq' && (
              <FAQ onNavigate={handleNavigate} />
            )}
          </main>
          <Footer onNavigate={handleNavigate} />
          <AIAssistant />
        </div>
      );
    }

    // Properties page with Navigation
    if (currentPage === 'properties') {
      return (
        <div className="app app-with-nav">
          <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
          <main className="page-content properties-page">
            <div className="properties-header">
              <h1>Your Personalized Properties</h1>
              <div className="header-controls">
                <select 
                  value={customerType} 
                  onChange={(e) => setCustomerType(e.target.value)}
                >
                  <option value="Work from Home Adult">💼 Work from Home Adult</option>
                  <option value="Elderly People">👴 Elderly People</option>
                  <option value="Families with Babies">👨‍👩‍👧‍👦 Families with Babies</option>
                  <option value="Asthma/Allergic People">🫁 Asthma/Allergic People</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Loading properties...
              </div>
            ) : error ? (
              <div className="error">
                <p>{error}</p>
                <button 
                  onClick={loadProperties}
                  className="btn-retry"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="properties-container">
                <PropertyList
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={setSelectedProperty}
                />
                {selectedProperty && (
                  <PropertyDetail
                    propertyId={selectedProperty.id}
                    customerType={customerType}
                    onCustomerTypeChange={setCustomerType}
                  />
                )}
              </div>
            )}
          </main>
          <Footer onNavigate={handleNavigate} />
          <AIAssistant />
        </div>
      );
    }
  };

  return renderPage();
}

export default App;

