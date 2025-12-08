import React, { useState, useEffect } from 'react';




const Dropdown = ({ label, name, activeDropdown, toggleDropdown, children }) => (
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

const FilterBar = ({ filters, options, onFilterChange }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [tempFilters, setTempFilters] = useState(filters);

  // Sync tempFilters when prop filters change (e.g. after Apply)
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleTempMultiSelectChange = (field, value) => {
    setTempFilters(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleTempRangeChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilter = (field) => {
    onFilterChange(field, tempFilters[field]);
    setActiveDropdown(null);
  };

  const applyRangeFilter = (fields) => {
    fields.forEach(field => {
      onFilterChange(field, tempFilters[field]);
    });
    setActiveDropdown(null);
  };



  return (
    <div className="filter-bar">
      <Dropdown label="Customer Region" name="region" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="dropdown-items-scroll">
          {options.regions?.map(region => (
            <label key={region} className="dropdown-item">
              <input
                type="checkbox"
                checked={tempFilters.region?.includes(region) || false}
                onChange={() => handleTempMultiSelectChange('region', region)}
              />
              {region}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="apply-btn"
          onClick={() => applyFilter('region')}
        >
          Apply
        </button>
      </Dropdown>

      <Dropdown label="Gender" name="gender" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="dropdown-items-scroll">
          {options.genders?.map(gender => (
            <label key={gender} className="dropdown-item">
              <input
                type="checkbox"
                checked={tempFilters.gender?.includes(gender) || false}
                onChange={() => handleTempMultiSelectChange('gender', gender)}
              />
              {gender}
            </label>
          ))}
        </div>

        <button
          type="button"
          className="apply-btn"
          onClick={() => applyFilter('gender')}
        >
          Apply
        </button>
      </Dropdown>

      <Dropdown label="Age Range" name="age" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="range-inputs p-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full mb-2 p-1 border rounded"
            value={tempFilters.minAge || ''}
            onChange={(e) => handleTempRangeChange('minAge', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full p-1 border rounded"
            value={tempFilters.maxAge || ''}
            onChange={(e) => handleTempRangeChange('maxAge', e.target.value)}
          />

          <button
            type="button"
            className="apply-btn"
            onClick={() => applyRangeFilter(['minAge', 'maxAge'])}
          >
            Apply
          </button>
        </div>
      </Dropdown>

      <Dropdown label="Product Category" name="category" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="dropdown-items-scroll">
          {options.categories?.map(category => (
            <label key={category} className="dropdown-item">
              <input
                type="checkbox"
                checked={tempFilters.category?.includes(category) || false}
                onChange={() => handleTempMultiSelectChange('category', category)}
              />
              {category}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="apply-btn"
          onClick={() => applyFilter('category')}
        >
          Apply
        </button>
      </Dropdown>

      <Dropdown label="Tags" name="tags" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="dropdown-items-scroll">
          {options.tags?.map(tag => (
            <label key={tag} className="dropdown-item">
              <input
                type="checkbox"
                checked={tempFilters.tags?.includes(tag) || false}
                onChange={() => handleTempMultiSelectChange('tags', tag)}
              />
              {tag}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="apply-btn"
          onClick={() => applyFilter('tags')}
        >
          Apply
        </button>
      </Dropdown>

      <Dropdown label="Payment Method" name="paymentMethod" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="dropdown-items-scroll">
          {options.paymentMethods?.map(method => (
            <label key={method} className="dropdown-item">
              <input
                type="checkbox"
                checked={tempFilters.paymentMethod?.includes(method) || false}
                onChange={() => handleTempMultiSelectChange('paymentMethod', method)}
              />
              {method}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="apply-btn"
          onClick={() => applyFilter('paymentMethod')}
        >
          Apply
        </button>
      </Dropdown>

      <Dropdown label="Date" name="date" activeDropdown={activeDropdown} toggleDropdown={toggleDropdown}>
        <div className="range-inputs p-2">
          <label className="text-xs text-gray-500">Start</label>
          <input
            type="date"
            className="w-full mb-2 p-1 border rounded"
            value={tempFilters.startDate || ''}
            onChange={(e) => handleTempRangeChange('startDate', e.target.value)}
          />
          <label className="text-xs text-gray-500">End</label>
          <input
            type="date"
            className="w-full p-1 border rounded"
            value={tempFilters.endDate || ''}
            onChange={(e) => handleTempRangeChange('endDate', e.target.value)}
          />
        </div>
        <button
          type="button"
          className="apply-btn"
          onClick={() => applyRangeFilter(['startDate', 'endDate'])}
        >
          Apply
        </button>
      </Dropdown>


      {activeDropdown && (
        <div className="dropdown-overlay" onClick={() => setActiveDropdown(null)}></div>
      )}
    </div>
  );
};

export default FilterBar;
