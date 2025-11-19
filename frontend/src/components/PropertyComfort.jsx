import React, { useState, useEffect } from 'react';
import { getPropertyComfort } from '../api';

const PropertyComfort = ({ propertyId, propertyName, customerType }) => {
  const [comfort, setComfort] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComfort = async () => {
      try {
        setLoading(true);
        const data = await getPropertyComfort(propertyId, customerType);
        setComfort(data);
      } catch (err) {
        console.error('Failed to load comfort data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComfort();
    // Refresh comfort data every 5 seconds
    const interval = setInterval(loadComfort, 5000);
    return () => clearInterval(interval);
  }, [propertyId, customerType]);

  if (loading) {
    return <div className="loading">Loading comfort analysis...</div>;
  }

  if (!comfort) {
    return <div className="error">No comfort data available</div>;
  }

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  const getSensorUnit = (sensorType) => {
    const units = {
      'TEMPERATURE': '°C',
      'HUMIDITY': '%',
      'LIGHT': 'lux',
      'SOUND': 'dB',
      'AIR_QUALITY': 'µg/m³'
    };
    return units[sensorType] || '';
  };

  return (
    <div className="comfort-display">
      <div className="comfort-score-card">
        <h4>Overall Comfort Score</h4>
        <div className="score-value">{comfort.overall_score}</div>
        <div className="score-label">{comfort.comfort_level}</div>
      </div>

      <div className="sensor-grid">
        {comfort.sensors.map((sensor) => (
          <div
            key={sensor.sensor_type}
            className={`sensor-card ${getStatusClass(sensor.status)}`}
          >
            <h5>{sensor.sensor_type.replace('_', ' ')}</h5>
            <div className="sensor-value">
              {sensor.value.toFixed(1)}
              {getSensorUnit(sensor.sensor_type)}
            </div>
            <span className={`sensor-status ${getStatusClass(sensor.status)}`}>
              {sensor.status}
            </span>
          </div>
        ))}
      </div>

      <div className="insights-section">
        <h4>💡 Why This Property is Right for You</h4>
        <ul className="insights-list">
          {comfort.insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PropertyComfort;

