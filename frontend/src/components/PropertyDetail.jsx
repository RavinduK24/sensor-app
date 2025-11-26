import React, { useState, useEffect } from 'react';
import PropertyComfort from './PropertyComfort';
import HistoricalCharts from './HistoricalCharts';
import { getProperty } from '../api';

const PropertyDetail = ({ propertyId, customerType, onCustomerTypeChange }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProperty(propertyId);
        setProperty(data);
      } catch (err) {
        setError('Failed to load property details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="property-detail">
        <div className="loading">
          <div className="spinner"></div>
          Loading property details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-detail">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail">
        <div className="empty">Select a property to view details</div>
      </div>
    );
  }

  return (
    <div className="property-detail">
      <div className="property-header">
        <h2>{property.name}</h2>
        <p className="address">{property.address}</p>
        <p className="description">{property.description}</p>
      </div>

      <PropertyComfort
        propertyId={property.id}
        propertyName={property.name}
        customerType={customerType}
      />
      
      <HistoricalCharts
        propertyId={property.id}
      />
    </div>
  );
};

export default PropertyDetail;

