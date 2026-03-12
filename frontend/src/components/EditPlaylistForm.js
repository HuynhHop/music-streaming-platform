import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './EditPlaylistForm.css';

const EditPlaylistForm = ({ playlistData, onInputChange, onSubmit, onCancel, onDeleteSong }) => {
  const [localPlaylistData, setLocalPlaylistData] = useState(playlistData);
  const navigate = useNavigate(); // Khởi tạo navigate

  // Handle form submission to update the playlist
  const handleFormSubmit = async (e) => {
    e.preventDefault();  // Prevent form from submitting the default way

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      // Fetch request to update the playlist title
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistData._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: localPlaylistData.title,  // Only update title
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update the playlist');
      }

      alert('Playlist updated successfully!');
      onSubmit(localPlaylistData);  // Pass updated playlist data to the parent
    } catch (error) {
      console.error('Error updating playlist:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle song title change
  const handleSongChange = (e, index) => {
    const updatedSongs = [...localPlaylistData.songs];
    updatedSongs[index].title = e.target.value;
    setLocalPlaylistData({ ...localPlaylistData, songs: updatedSongs });
    onInputChange(e, index);  // Call parent's input change handler if needed
  };

  // Handle song deletion and call API to remove song from playlist
  const handleDeleteSong = async (index) => {
    const songId = localPlaylistData.songs[index]._id;  // Get the song ID from the playlist
    const playlistId = playlistData._id;  // Playlist ID

    console.log("SOngid:", songId)
    console.log("playlist:", playlistId)
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      // Make API call to delete the song from the playlist
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/song/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove song from playlist');
      }

      alert('Song removed successfully from playlist');
      
      // Remove the song from local state after successful deletion
      const updatedSongs = localPlaylistData.songs.filter((_, i) => i !== index);
      setLocalPlaylistData({ ...localPlaylistData, songs: updatedSongs });
      onDeleteSong(index);  // Notify parent about song deletion (optional)
    } catch (error) {
      console.error('Error removing song from playlist:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Hàm xử lý khi nhấp vào bài hát
  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } }); // Điều hướng tới trang chi tiết bài hát
  };

  return (
    <div className="edit-playlist-form">
      <h2>Chỉnh sửa Playlist</h2>
      <form onSubmit={handleFormSubmit}>
        <label>
          Tên Playlist:
          <input
            type="text"
            name="title"
            value={localPlaylistData.title}
            onChange={(e) => setLocalPlaylistData({ ...localPlaylistData, title: e.target.value })}
            required
          />
        </label>

        <label>
          Danh sách Bài hát:
          {localPlaylistData.songs.map((song, index) => (
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

EditPlaylistForm.propTypes = {
  playlistData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    songs: PropTypes.array.isRequired,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDeleteSong: PropTypes.func.isRequired,  // Callback to notify parent about song deletion
};

export default EditPlaylistForm;
