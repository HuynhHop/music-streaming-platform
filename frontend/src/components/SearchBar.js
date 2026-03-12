import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook dùng cho điều hướng
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('song'); // Mặc định tìm kiếm theo bài hát
  const navigate = useNavigate(); // Hook điều hướng

  const handleInputChange = (e) => {
    setQuery(e.target.value); // Cập nhật state query
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value); // Cập nhật kiểu tìm kiếm
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn chặn hành động mặc định
    if (query.trim()) {
      // Chuyển hướng đến SearchPage với query và loại tìm kiếm trong URL
      navigate(`/search?query=${query}&type=${searchType}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        className="search-input"
        placeholder="Tìm kiếm..."
        value={query}
        onChange={handleInputChange}
      />
      <select className="search-type" value={searchType} onChange={handleSearchTypeChange}>
        <option value="song">Bài hát</option>
        <option value="user">Người dùng</option>
        <option value="playlist">Playlist</option>
        <option value="album">Album</option>
        {/* <option value="playlist">Playlist</option> */}
      </select>
      <button type="submit" className="search-button">Tìm kiếm</button>
    </form>
  );
};

export default SearchBar;
