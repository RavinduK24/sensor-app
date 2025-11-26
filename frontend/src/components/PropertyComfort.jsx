import React, { useState, useEffect } from 'react';
import { getPropertyComfort } from '../api';

const PropertyComfort = ({ propertyId, propertyName, customerType }) => {
  const [comfort, setComfort] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComfort = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const data = await getPropertyComfort(propertyId, customerType);
        setComfort(data);
      } catch (err) {
        console.error('Failed to load comfort data:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    loadComfort(true);
    // Refresh comfort data every 5 seconds
    const interval = setInterval(() => loadComfort(false), 5000);
    return () => clearInterval(interval);
  }, [propertyId, customerType]);

  if (loading) {
    return <div className="loading">Loading comfort analysis...</div>;
  }

  if (!comfort) {
    return <div className="error">No comfort data available</div>;
  }

  const overallScoreDisplay = comfort.overall_score !== null && comfort.overall_score !== undefined
    ? comfort.overall_score.toFixed(1)
    : '—';

  const getStatusClass = (status) => {
    const map = {
      'ideal': 'excellent',
      'comfortable': 'good',
      'monitor': 'fair',
      'attention': 'poor',
      'no data': 'no-data'
    };
    return map[status.toLowerCase()] || 'fair';
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

  const formatValue = (value, sensorType) => {
    if (value === null || value === undefined) {
      return '—';
    }
    const decimals = sensorType === 'LIGHT' ? 0 : 1;
    return `${value.toFixed(decimals)}${getSensorUnit(sensorType)}`;
  };

  const formatRange = (sensor) => {
    const unit = getSensorUnit(sensor.sensor_type);
    const { preferred_min: min, preferred_max: max } = sensor;
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
      return `${min.toFixed(0)}–${max.toFixed(0)}${unit}`;
    }
    if (max !== null && max !== undefined) {
      return `< ${max.toFixed(0)}${unit}`;
    }
    if (min !== null && min !== undefined) {
      return `> ${min.toFixed(0)}${unit}`;
    }
    return '—';
  };

  const formatMatch = (sensor) => {
    if (sensor.percentage_match === null || sensor.percentage_match === undefined) {
      return 'No annual data';
    }
    const daysText = sensor.days_tracked ? ` • ${sensor.days_tracked}d` : '';
    return `${sensor.percentage_match.toFixed(1)}%${daysText}`;
  };

  return (
    <div className="comfort-display">
      <div className="comfort-score-card">
        <h4>Overall Comfort Score</h4>
        <div className="score-value">{overallScoreDisplay}</div>
        <div className="score-label">{comfort.comfort_level}</div>
      </div>

      <div className="sensor-grid">
        {comfort.sensors.map((sensor) => {
          const statusClass = getStatusClass(sensor.status);
          const scoreDisplay = sensor.score !== null && sensor.score !== undefined
            ? sensor.score.toFixed(1)
            : '—';
          return (
            <div
              key={sensor.sensor_type}
              className={`sensor-card ${statusClass}`}
            >
              <div className="sensor-card-header">
                <div>
                  <h5>{sensor.sensor_type.replace('_', ' ')}</h5>
                  <div className="target-range">Target: {formatRange(sensor)}</div>
                </div>
                <div className="score-badge">
                  <span className="score-number">{scoreDisplay}</span>
                  <span className={`sensor-status ${statusClass}`}>{sensor.status}</span>
                </div>
              </div>

              <div className="sensor-metrics">
                <div className="sensor-metric">
                  <span className="metric-label">Current</span>
                  <span className="metric-value">
                    {formatValue(sensor.current_value, sensor.sensor_type)}
                  </span>
                </div>
                <div className="sensor-metric">
                  <span className="metric-label">Daily Avg</span>
                  <span className="metric-value">
                    {formatValue(sensor.daily_average, sensor.sensor_type)}
                  </span>
                </div>
              </div>

              <div className="sensor-footnote">
                Annual match: {formatMatch(sensor)}
              </div>

              <p className="sensor-insight">{sensor.insight}</p>
            </div>
          );
        })}
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

