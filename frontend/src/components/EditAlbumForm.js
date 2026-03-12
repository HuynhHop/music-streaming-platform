import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditAlbumForm.css';

const EditAlbumForm = ({ albumId, albumData, onInputChange, onSubmit, onCancel }) => {
  const [newSongTitle, setNewSongTitle] = useState('');
  const [isAddingSong, setIsAddingSong] = useState(false);
  const navigate = useNavigate();

  const handleAddSong = async () => {
    if (!newSongTitle) {
      alert('Vui lòng nhập tên bài hát!');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      const response = await fetch(`http://localhost:5000/api/albums/${albumId}/add-song`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songTitle: newSongTitle }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add the song');
      }

      alert('Bài hát đã được thêm thành công!');
      setNewSongTitle('');
      setIsAddingSong(false);
      onInputChange({ target: { name: 'songs', value: data.album.songs } });
    } catch (error) {
      console.error('Error adding song:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteSong = async (songId, index) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      const response = await fetch(`http://localhost:5000/api/albums/${albumId}/song/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete the song');
      }

      alert('Bài hát đã được xóa!');
      const updatedSongs = albumData.songs.filter((_, i) => i !== index);
      onInputChange({ target: { name: 'songs', value: updatedSongs } });
    } catch (error) {
      console.error('Error deleting song:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      const response = await fetch(`http://localhost:5000/api/albums/${albumId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: albumData.title,
          desc: albumData.desc,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update the album');
      }

      alert('Album updated successfully!');
      onSubmit(albumData);
    } catch (error) {
      console.error('Error updating album:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="edit-album-form-container">
      <h3>Chỉnh sửa Album</h3>
      <form onSubmit={handleFormSubmit}>
        {/* Title Input */}
        <label>
          Tiêu đề:
          <input
            type="text"
            name="title"
            value={albumData.title}
            onChange={onInputChange}
            placeholder="Nhập tiêu đề album"
          />
        </label>
  
        {/* Description Textarea */}
        <label>
          Mô tả:
          <textarea
            name="desc"
            value={albumData.desc}
            onChange={onInputChange}
            placeholder="Nhập mô tả album"
          />
        </label>
  
        {/* Song List */}
        <div className="edit-album-form-container__songs">
          <h4>Danh sách bài hát:</h4>
          {albumData.songs.map((song, index) => (
            <div key={song._id} className="song-item">
              <input
                type="text"
                value={song.title}
                readOnly
                onClick={() => navigate(`/song/${song._id}`)}
                title="Nhấp để xem chi tiết bài hát"
              />
              <button
                type="button"
                className="delete-song-btn"
                onClick={() => handleDeleteSong(song._id, index)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
  
        {/* Add New Song Section */}
        {isAddingSong ? (
          <div className="add-song-container">
            <input
              type="text"
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              placeholder="Nhập tên bài hát mới"
            />
            <button onClick={handleAddSong}>Thêm</button>
            <button onClick={() => setIsAddingSong(false)}>Hủy</button>
          </div>
        ) : (
          <button
            type="button"
            className="add-song-btn"
            onClick={() => setIsAddingSong(true)}
          >
            Thêm bài hát
          </button>
        )}
  
        {/* Form Buttons */}
        <div className="edit-album-form-container__buttons">
          <button type="submit">Lưu</button>
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );  
};

export default EditAlbumForm;
