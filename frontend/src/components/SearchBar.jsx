import React from 'react';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [term, setTerm] = React.useState(initialValue);

  const handleChange = (e) => {
    setTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="search-bar">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        placeholder="Name, Phone No."
        value={term}
        onChange={handleChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
