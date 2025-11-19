import React, { useState, useEffect } from 'react';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import { getProperties } from './api';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [customerType, setCustomerType] = useState('Working Adult');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProperties(customerType);
      setProperties(data);
      
      // If we have a selected property, update it with new comfort scores
      if (selectedProperty) {
        const updatedProperty = data.find(p => p.id === selectedProperty.id);
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      } else if (data.length > 0) {
        // Auto-select first property
        setSelectedProperty(data[0]);
      }
    } catch (err) {
      setError('Failed to load properties. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [customerType]);

  const handleCustomerTypeChange = (newType) => {
    setCustomerType(newType);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🏠 Smart Real Estate Sensor Platform</h1>
            <p className="header-subtitle">
              Find your perfect property based on comfort and indoor conditions
            </p>
          </div>
          <div className="customer-selector">
            <label>Customer Profile:</label>
            <select 
              value={customerType} 
              onChange={(e) => handleCustomerTypeChange(e.target.value)}
            >
              <option value="Working Adult">💼 Working Adult</option>
              <option value="Stay-home Elderly">🏠 Stay-home Elderly</option>
            </select>
          </div>
        </div>
      </header>

      <main className="main-content">
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
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <PropertyList
              properties={properties}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedProperty}
            />
            {selectedProperty && (
              <PropertyDetail
                propertyId={selectedProperty.id}
                customerType={customerType}
                onCustomerTypeChange={handleCustomerTypeChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

