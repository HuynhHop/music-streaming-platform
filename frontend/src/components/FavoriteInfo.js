import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import SongItemV2 from './SongItemV2';
import './FavoriteInfo.css';

const FavoriteInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const favorite = location.state?.favoriteData;

  const [isDeleting, setIsDeleting] = useState(false); // Quản lý trạng thái xóa
  const [songToDelete, setSongToDelete] = useState(null); // Lưu bài hát cần xóa

  if (!favorite) {
    return <p className="no-data">No favorite data provided. Please navigate properly.</p>;
  }

  // Hàm Xóa Bài Hát Từ Yêu Thích
  const deleteSongFromFavorite = async (songId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      const response = await fetch(
        `http://localhost:5000/api/favorites/${favorite._id}/song/${songId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const updatedSongs = favorite.songs.filter((song) => song._id !== songId);
        favorite.songs = updatedSongs; // Cập nhật danh sách bài hát
        setSongToDelete(null); // Xóa bài hát khỏi trạng thái
        setIsDeleting(false); // Đóng modal xác nhận
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete song from favorite');
      }
    } catch (error) {
      console.error('Error deleting song from favorite:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleDeleteConfirm = (songId) => {
    setIsDeleting(true);
    setSongToDelete(songId);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setSongToDelete(null);
  };

  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } });
  };

  return (
    <div className="favorite-page">
      <div className="favorite-container">
        <div className="favorite-info">
          <h1>{favorite.title} ❤️</h1>
        </div>

        <div className="songs-list">
          <h2>Songs in Favorite</h2>
          {favorite.songs && favorite.songs.length > 0 ? (
            <ul>
              {favorite.songs.map((song) => (
                <SongItemV2
                  key={song._id}
                  song={song}
                  onSongClick={handleSongClick}
                  onDelete={() => handleDeleteConfirm(song._id)}
                  enableDelete={true}
                />
              ))}
            </ul>
          ) : (
            <p>No songs available in this favorite.</p>
          )}
        </div>

        {/* Modal Xác Nhận Xóa */}
        {isDeleting && (
          <div className="confirm-delete-modal">
            <div className="modal-content">
              <h3>Are you sure you want to delete this song from your favorite?</h3>
              <button onClick={() => deleteSongFromFavorite(songToDelete)}>Yes</button>
              <button onClick={handleDeleteCancel}>No</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FavoriteInfo.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default FavoriteInfo;
