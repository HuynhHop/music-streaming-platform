import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [imageMap, setImageMap] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState(''); // Lưu kiểu tìm kiếm
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  // Fetch ảnh cho các bài hát
  const fetchImages = async (songs) => {
    const newImageMap = {};
    for (const song of songs) {
      if (song?.linkImg) {
        try {
          const response = await fetch(song.linkImg, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            newImageMap[song._id] = URL.createObjectURL(blob); // Lưu URL của ảnh
          }
        } catch (error) {
          console.error(`Error fetching image for song ${song.title}:`, error);
        }
      }
    }
    setImageMap(newImageMap); // Cập nhật ảnh vào state
  };

  const performAlbumSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/albums/title/${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch album search results');
      }
      const data = await response.json();
      setSearchResults(data.albums); // Lưu kết quả album
    } catch (error) {
      console.error('Error fetching album search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API tìm kiếm bài hát
  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/songs/title/${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data); // Chỉ lưu kết quả bài hát
      fetchImages(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API tìm kiếm người dùng
  const performUserSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/name/${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user search results');
      }
      const data = await response.json();
      setSearchResults(data.users); // Chỉ lưu kết quả người dùng
    } catch (error) {
      console.error('Error fetching user search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API tìm kiếm playlist
  const performPlaylistSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/playlists/title/${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch playlist search results');
      }
      const data = await response.json();
      setSearchResults(data.playlists); // Chỉ lưu kết quả playlist
    } catch (error) {
      console.error('Error fetching playlist search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Điều kiện để gọi hàm tìm kiếm theo type
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('query');
    const searchType = queryParams.get('type'); // Kiểm tra kiểu tìm kiếm

    if (searchQuery && searchType) {
      setQuery(searchQuery);
      setSearchType(searchType); // Lưu kiểu tìm kiếm vào state
      if (searchType === 'user') {
        performUserSearch(searchQuery);
      } else if (searchType === 'song') {
        performSearch(searchQuery);
      } else if (searchType === 'playlist') {
        performPlaylistSearch(searchQuery);
      } else if (searchType === 'album') {
      performAlbumSearch(searchQuery);
      }
    }
  }, [location]);

  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } });
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`, { state: { playlist } });
  };

  const handleUserClick = (user) => {
    navigate(`/user/${user._id}`, { state: { user } });
  };

  return (
    <div className="sp-search-page-container">
      <h2>Kết quả tìm kiếm cho: "{query}"</h2>
      {loading && <p>Đang tìm kiếm...</p>}
      {!loading && searchResults.length === 0 && <p>Không có kết quả tìm kiếm.</p>}

      {/* Hiển thị kết quả tìm kiếm phù hợp với kiểu */}
      {searchType === 'song' && searchResults[0]?.title && (
        <div className="sp-result-category">
          <h3>Bài hát</h3>
          <div className="sp-result-list">
            {searchResults.map((song) => (
              <div
                key={song._id}
                className="sp-result-item"
                onClick={() => handleSongClick(song)}
              >
                <img
                  src={imageMap[song._id] || 'default-image.jpg'}
                  alt={song.title}
                  className="sp-result-img"
                />
                <div className="sp-result-title">{song.title}</div>
                <div className="sp-result-subtitle">{song.artist?.fullName || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchType === 'user' && searchResults[0]?.fullname && (
        <div className="sp-result-category">
          <h3>Người dùng</h3>
          <div className="sp-result-list">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="sp-result-item"
                onClick={() => handleUserClick(user)}
              >
                <div className="sp-result-title">{user.fullname}</div>
                <div className="sp-result-subtitle">{user.gender}</div>
                <div className="sp-result-desc">{user.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchType === 'playlist' && searchResults[0]?.title && (
        <div className="sp-result-category">
          <h3>Playlist</h3>
          <div className="sp-result-list">
            {searchResults.map((playlist) => (
              <div
                key={playlist._id}
                className="sp-result-item"
                onClick={() => handlePlaylistClick(playlist)}
              >
                <div className="sp-result-title">{playlist.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchType === 'album' && searchResults[0]?.title && (
        <div className="sp-result-category">
          <h3>Album</h3>
          <div className="sp-result-list">
            {searchResults.map((album) => (
              <div
                key={album._id}
                className="sp-result-item"
                onClick={() => navigate(`/album/${album._id}`, { state: { album } })}
              >
                <div className="sp-result-title">{album.title}</div>
                <div className="sp-result-subtitle">{album.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
