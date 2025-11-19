import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { get24HourHistory, getMonthlyHistory, getYearlyHistory } from '../api';

const HistoricalCharts = ({ propertyId }) => {
  const [chartView, setChartView] = useState('24hour'); // '24hour', 'monthly', 'yearly'
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      let historyData;
      
      if (chartView === '24hour') {
        historyData = await get24HourHistory(propertyId);
      } else if (chartView === 'monthly') {
        historyData = await getMonthlyHistory(propertyId);
      } else if (chartView === 'yearly') {
        historyData = await getYearlyHistory(propertyId);
      }
      
      setChartData(historyData);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [propertyId, chartView]);

  const sensorColors = {
    'TEMPERATURE': '#ef4444',
    'HUMIDITY': '#3b82f6',
    'LIGHT': '#f59e0b',
    'SOUND': '#8b5cf6',
    'AIR_QUALITY': '#10b981'
  };

  const sensorLabels = {
    'TEMPERATURE': 'Temperature (°C)',
    'HUMIDITY': 'Humidity (%)',
    'LIGHT': 'Light (lux)',
    'SOUND': 'Sound (dB)',
    'AIR_QUALITY': 'Air Quality (µg/m³)'
  };

  const formatChartData = (sensorType) => {
    if (!chartData[sensorType] || chartData[sensorType].length === 0) {
      return [];
    }

    if (chartView === '24hour') {
      // For 24-hour view, use decimal time values (10-minute intervals)
      // time comes as decimal (0, 0.166, 0.333, ..., 23.833)
      return chartData[sensorType].map(item => ({
        time: item.time,
        value: item.value
      }));
    } else {
      // For monthly/yearly views, use date
      return chartData[sensorType].map(item => ({
        time: item.date,
        value: item.value
      }));
    }
  };

  const getChartTitle = () => {
    switch (chartView) {
      case '24hour':
        return 'Real-Time & 24-Hour History';
      case 'monthly':
        return 'Monthly Trend (Last 30 Days)';
      case 'yearly':
        return 'Yearly Trend (Last 365 Days)';
      default:
        return 'Historical Data';
    }
  };

  if (loading) {
    return <div className="loading">Loading historical data...</div>;
  }

  return (
    <div className="charts-section">
      <div className="chart-view-selector">
        <h3>Historical Data</h3>
        <div className="view-buttons">
          <button
            className={chartView === '24hour' ? 'active' : ''}
            onClick={() => setChartView('24hour')}
          >
            24 Hours
          </button>
          <button
            className={chartView === 'monthly' ? 'active' : ''}
            onClick={() => setChartView('monthly')}
          >
            Monthly
          </button>
          <button
            className={chartView === 'yearly' ? 'active' : ''}
            onClick={() => setChartView('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h4>{getChartTitle()}</h4>
          {chartView === '24hour' && (
            <div className="realtime-indicator">
              <div className="pulse-dot"></div>
              <span>Live updating</span>
            </div>
          )}
        </div>
        
        {Object.keys(sensorColors).map(sensorType => {
          const data = formatChartData(sensorType);
          
          if (data.length === 0) {
            return null;
          }

          return (
            <div key={sensorType} className="sensor-chart">
              <h5>{sensorLabels[sensorType]}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    type={chartView === '24hour' ? 'number' : 'category'}
                    domain={chartView === '24hour' ? [0, 24] : undefined}
                    ticks={chartView === '24hour' ? [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] : undefined}
                    tick={{ fontSize: 11 }}
                    angle={chartView === '24hour' ? 0 : -45}
                    textAnchor={chartView === '24hour' ? 'middle' : 'end'}
                    height={chartView === '24hour' ? 40 : 80}
                    interval={chartView === '24hour' ? 0 : chartView === 'yearly' ? Math.floor(data.length / 12) : chartView === 'monthly' ? Math.floor(data.length / 10) : 'preserveStartEnd'}
                    label={chartView === '24hour' ? { value: 'Hour (0-23)', position: 'insideBottom', offset: -10 } : null}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => value !== null ? value.toFixed(2) : 'No data'}
                    labelFormatter={(label) => chartView === '24hour' ? `Hour: ${Math.floor(label)}:${String(Math.round((label % 1) * 60)).padStart(2, '0')}` : `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={sensorColors[sensorType]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoricalCharts;

