import React from 'react';

export default function SearchControls({
  searchTerm,
  onSearchChange,
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onCategoryChange,
  onLocationChange,
  minUpvotes,
  onMinUpvotesChange,
  hasActiveFilters,
  onClearAll,
}) {
  return (
    <section className="search-controls">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by summary, location, or category..."
          value={searchTerm}
          onChange={onSearchChange}
          className="search-input"
          autoComplete="off"
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

        <div className="filter-group">
          <label>Min. Upvotes</label>
          <select
            value={minUpvotes}
            onChange={onMinUpvotesChange}
            className="filter-select"
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
            <option value={25}>25+</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="filter-group filter-group-clear">
            <label>&nbsp;</label>
            <button className="filter-clear-btn" onClick={onClearAll}>
              ✕ Clear All
            </button>
          </div>
        )}
      </div>
    </section>
  );
}