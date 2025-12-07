import React from 'react';

const SortControl = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-control">
      <label>Sort By: </label>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="date">Date (Newest First)</option>
        <option value="quantity">Quantity (High to Low)</option>
        <option value="customer_name">Customer Name (A-Z)</option>
      </select>

    </div>
  );
};

export default SortControl;
