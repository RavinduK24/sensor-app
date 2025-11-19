import React from 'react';

const PropertyList = ({ properties, selectedProperty, onSelectProperty }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="property-list">
        <h2>Properties</h2>
        <div className="empty">No properties available</div>
      </div>
    );
  }

  return (
    <div className="property-list">
      <h2>Properties</h2>
      <div className="property-cards">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`property-card ${selectedProperty?.id === property.id ? 'selected' : ''}`}
            onClick={() => onSelectProperty(property)}
          >
            <img
              src={property.image_url}
              alt={property.name}
              className="property-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x150?text=Property+Image';
              }}
            />
            <h3>{property.name}</h3>
            <p>{property.address}</p>
            <div className={`comfort-badge ${property.comfort_level.toLowerCase()}`}>
              <span>{property.overall_comfort_score}/100</span>
              <span>{property.comfort_level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;

