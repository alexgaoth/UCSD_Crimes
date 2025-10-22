import React from 'react';

export default function SearchControls({ 
  searchTerm, 
  onSearchChange, 
  onKeyDown,
  categories, 
  locations, 
  selectedCategory, 
  selectedLocation, 
  onCategoryChange, 
  onLocationChange 
}) {
  return (
    <section className="search-controls">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by summary, location, or category... (Press Enter to search)"
          value={searchTerm}
          onChange={onSearchChange}
          onKeyDown={onKeyDown}
          className="search-input"
        />
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={onCategoryChange}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <select
            value={selectedLocation}
            onChange={onLocationChange}
            className="filter-select"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}