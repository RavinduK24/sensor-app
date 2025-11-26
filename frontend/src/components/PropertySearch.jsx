import React, { useState, useEffect } from 'react';
import { getProperties } from '../api';

export default function PropertySearch({ onSelectProperty, onBack }) {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: 0,
    maxPrice: 10000000,
    customerType: 'Work from Home Adult',
    sortBy: 'relevance'
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties(filters.customerType);
      setProperties(data);
      applyFilters(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data.filter(prop => {
      const priceMatch = prop.price >= filters.minPrice && prop.price <= filters.maxPrice;
      const searchMatch = prop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          prop.location.toLowerCase().includes(filters.search.toLowerCase());
      return priceMatch && searchMatch;
    });

    // Sort
    if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'comfort') {
      filtered.sort((a, b) => (b.overall_comfort_score || 0) - (a.overall_comfort_score || 0));
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    applyFilters(properties);
  };

  const handleCustomerTypeChange = (type) => {
    const newFilters = { ...filters, customerType: type };
    setFilters(newFilters);
    // Reload properties for new customer type with updated filters
    setTimeout(() => {
      loadPropertiesWithType(type);
    }, 0);
  };

  const loadPropertiesWithType = async (customerType) => {
    try {
      setLoading(true);
      const data = await getProperties(customerType);
      setProperties(data);
      applyFilters(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-search-page">
      {/* Back Button */}
      <div className="search-header">
        <button className="btn-back-search" onClick={onBack}>
          ← Back
        </button>
        <h1>Find Your Perfect Home</h1>
      </div>

      <div className="search-container">
        {/* Sidebar Filters */}
        <aside className="search-filters">
          <h3>Search Filters</h3>
          
          {/* Search Bar */}
          <div className="filter-group">
            <label>Search by Name or Location</label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                className="filter-input-small"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                className="filter-input-small"
              />
            </div>
          </div>

          {/* Customer Type */}
          <div className="filter-group">
            <label>Profile Type</label>
            <div className="profile-buttons">
              {['Work from Home Adult', 'Elderly People', 'Families with Babies', 'Asthma/Allergic People'].map(type => (
                <button
                  key={type}
                  className={`profile-btn ${filters.customerType === type ? 'active' : ''}`}
                  onClick={() => handleCustomerTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Most Relevant</option>
              <option value="comfort">Comfort Score</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="search-results">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="empty-state">
              <p>No properties found matching your criteria.</p>
              <button onClick={() => setFilters({search: '', minPrice: 0, maxPrice: 10000000, customerType: 'Work from Home Adult', sortBy: 'relevance'})} className="btn-reset">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>Found {filteredProperties.length} properties</h2>
              </div>
              <div className="properties-grid">
                {filteredProperties.map(property => (
                  <div key={property.id} className="search-property-card" onClick={() => onSelectProperty(property)}>
                    <div className="card-image">
                      <div className="image-placeholder">📍</div>
                      {property.comfort_score && (
                        <div className="comfort-badge">{property.comfort_score.toFixed(1)}</div>
                      )}
                    </div>
                    <div className="card-body">
                      <h3>{property.name}</h3>
                      <p className="location">📍 {property.location}</p>
                      <p className="price">${property.price.toLocaleString()}</p>
                      <div className="property-tags">
                        {property.features && property.features.slice(0, 2).map((feat, i) => (
                          <span key={i} className="tag">{feat}</span>
                        ))}
                      </div>
                      <button className="btn-view-details">View Details →</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
