// src/components/SearchInput.js
import React from 'react';

const SearchInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Search..."
      className="search-input"
    />
  );
};

export default SearchInput;
