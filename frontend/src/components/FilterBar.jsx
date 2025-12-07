import React, { useState } from 'react';

const FilterBar = ({ filters, options, onFilterChange }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = filters[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(field, newValues);
  };

  const handleRangeChange = (field, value) => {
    onFilterChange(field, value);
  }

  const Dropdown = ({ label, name, children }) => (
    <div className="filter-dropdown">
      <button
        className={`dropdown-btn ${activeDropdown === name ? 'active' : ''}`}
        onClick={() => toggleDropdown(name)}
      >
        {label} <span className="arrow">▼</span>
      </button>
      {activeDropdown === name && (
        <div className="dropdown-content">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="filter-bar">
      <Dropdown label="Customer Region" name="region">
        {options.regions?.map(region => (
          <label key={region} className="dropdown-item">
            <input
              type="checkbox"
              checked={filters.region?.includes(region) || false}
              onChange={() => handleMultiSelectChange('region', region)}
            />
            {region}
          </label>
        ))}
      </Dropdown>

      <Dropdown label="Gender" name="gender">
        {options.genders?.map(gender => (
          <label key={gender} className="dropdown-item">
            <input
              type="checkbox"
              checked={filters.gender?.includes(gender) || false}
              onChange={() => handleMultiSelectChange('gender', gender)}
            />
            {gender}
          </label>
        ))}
      </Dropdown>

      <Dropdown label="Age Range" name="age">
        <div className="range-inputs p-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full mb-2 p-1 border rounded"
            value={filters.minAge || ''}
            onChange={(e) => handleRangeChange('minAge', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full p-1 border rounded"
            value={filters.maxAge || ''}
            onChange={(e) => handleRangeChange('maxAge', e.target.value)}
          />
        </div>
      </Dropdown>

      <Dropdown label="Product Category" name="category">
        {options.categories?.map(category => (
          <label key={category} className="dropdown-item">
            <input
              type="checkbox"
              checked={filters.category?.includes(category) || false}
              onChange={() => handleMultiSelectChange('category', category)}
            />
            {category}
          </label>
        ))}
      </Dropdown>

      <Dropdown label="Tags" name="tags">
        {options.tags?.map(tag => (
          <label key={tag} className="dropdown-item">
            <input
              type="checkbox"
              checked={filters.tags?.includes(tag) || false}
              onChange={() => handleMultiSelectChange('tags', tag)}
            />
            {tag}
          </label>
        ))}
      </Dropdown>

      <Dropdown label="Payment Method" name="paymentMethod">
        {options.paymentMethods?.map(method => (
          <label key={method} className="dropdown-item">
            <input
              type="checkbox"
              checked={filters.paymentMethod?.includes(method) || false}
              onChange={() => handleMultiSelectChange('paymentMethod', method)}
            />
            {method}
          </label>
        ))}
      </Dropdown>

      <Dropdown label="Date" name="date">
        <div className="range-inputs p-2">
          <label className="text-xs text-gray-500">Start</label>
          <input
            type="date"
            className="w-full mb-2 p-1 border rounded"
            value={filters.startDate || ''}
            onChange={(e) => handleRangeChange('startDate', e.target.value)}
          />
          <label className="text-xs text-gray-500">End</label>
          <input
            type="date"
            className="w-full p-1 border rounded"
            value={filters.endDate || ''}
            onChange={(e) => handleRangeChange('endDate', e.target.value)}
          />
        </div>
      </Dropdown>


      {activeDropdown && (
        <div className="dropdown-overlay" onClick={() => setActiveDropdown(null)}></div>
      )}
    </div>
  );
};

export default FilterBar;
