import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './EditPlaylistForm.css';

const EditFavoritesForm = ({ favoriteData, onInputChange, onSubmit, onCancel, onDeleteSong }) => {
  const [localFavoriteData, setLocalFavoriteData] = useState(favoriteData);
  const navigate = useNavigate(); // Khởi tạo navigate
  const storedUserData = JSON.parse(localStorage.getItem('userdata')); // Fetch user data
  const creatorId = storedUserData?._id || ''; // Get creator ID from user data

  // Ensure that songs is an array, default to empty array if undefined
  // Handle form submission to update the favorites list
  const handleFormSubmit = async (e) => {
    e.preventDefault();  // Prevent form from submitting the default way

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      // Fetch request to update the favorites title with creatorId and favoriteId in URL params
      const response = await fetch(`http://localhost:5000/api/favorites/creator/${creatorId}/${favoriteData._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: localFavoriteData.title,  // Only update title
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update the favorites');
      }

      alert('Favorites updated successfully!');
      onSubmit(localFavoriteData);  // Pass updated favorites data to the parent
    } catch (error) {
      console.error('Error updating favorites:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle song title change
  const handleSongChange = (e, index) => {
    const updatedSongs = [...localFavoriteData.songs];
    updatedSongs[index].title = e.target.value;
    setLocalFavoriteData({ ...localFavoriteData, songs: updatedSongs });
    onInputChange(e, index);  // Call parent's input change handler if needed
  };

  // Handle song deletion and call API to remove song from favorites
  const handleDeleteSong = async (index) => {
    const songId = localFavoriteData.songs[index]._id;  // Get the song ID from the favorites
    const favoritesId = favoriteData._id;  // Favorites ID

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      // Make API call to delete the song from the favorites
      const response = await fetch(`http://localhost:5000/api/favorites/${favoritesId}/song/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove song from favorites');
      }

      alert('Song removed successfully from favorites');
      
      // Remove the song from local state after successful deletion
      const updatedSongs = localFavoriteData.songs.filter((_, i) => i !== index);
      setLocalFavoriteData({ ...localFavoriteData, songs: updatedSongs });
      onDeleteSong(index);  // Notify parent about song deletion (optional)
    } catch (error) {
      console.error('Error removing song from favorites:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Hàm xử lý khi nhấp vào bài hát
  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } }); // Điều hướng tới trang chi tiết bài hát
  };

  return (
    <div className="edit-playlist-form">
      <h2>Chỉnh sửa Favorites</h2>
      <form onSubmit={handleFormSubmit}>
        <label>
          Tên Favorites:
          <input
            type="text"
            name="title"
            value={localFavoriteData.title}
            onChange={(e) => setLocalFavoriteData({ ...localFavoriteData, title: e.target.value })}
            required
          />
        </label>

        <label>
          Danh sách Bài hát:
          {localFavoriteData.songs.map((song, index) => (
            <div key={index} className="song-item">
              {/* Thêm sự kiện onClick để chuyển hướng khi nhấp vào bài hát */}
              <input
                type="text"
                name={`song-${index}`}
                value={song.title}
                onChange={(e) => handleSongChange(e, index)}
                placeholder={`Bài hát ${index + 1}`}
                required
                onClick={() => handleSongClick(song)}  // Điều hướng đến trang chi tiết
                style={{ cursor: 'pointer' }} // Thêm con trỏ chuột dạng tay khi di chuột lên bài hát
              />
              <button
                type="button"
                className="delete-song-btn"
                onClick={() => handleDeleteSong(index)}
              >
                Xóa
              </button>
            </div>
          ))}
        </label>

        <div className="edit-playlist-form__buttons">
          <button type="submit">Lưu</button>
          <button type="button" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

EditFavoritesForm.propTypes = {
  favoriteData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    songs: PropTypes.array.isRequired,
  }).isRequired,
  creatorId: PropTypes.string.isRequired,  // Pass creatorId as prop
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDeleteSong: PropTypes.func.isRequired,  // Callback to notify parent about song deletion
};

export default EditFavoritesForm;
