import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditPlaylistForm from './EditPlaylistForm'; // Giả sử bạn có form chỉnh sửa Playlist
import './MyPlaylistItem.css';

const MyPlaylistItem = ({ playlist, onEdit, onDelete, onClick }) => {
  const { title, createAt, songs, isDeleted, creator, _id } = playlist;

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [playlistData, setPlaylistData] = useState({
    _id,
    title,
    songs,
  });

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleEditClick = () => {
    setShowMenu(false);
    setIsEditing(true); // Mở form chỉnh sửa
  };

  
  const handleClickPlayList = () => {
    if (onClick) onClick(playlist); // Gọi callback khi nhấn vào album
  };

  const handleDeleteClick = async () => {
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Lấy access token từ localStorage
        if (!accessToken) {
          throw new Error("Access token is missing. Please log in again.");
        }

        const response = await fetch(`http://localhost:5000/api/playlists/${_id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to delete the playlist");
        }

        alert(data.message); // Hiển thị thông báo thành công
        if (onDelete) onDelete(_id); // Gọi callback để cập nhật UI
      } catch (error) {
        console.error("Error deleting playlist:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = (e) => {
    // e.preventDefault();
    if (onEdit) onEdit(playlist._id, playlistData); // Gọi callback chỉnh sửa với dữ liệu mới
    setIsEditing(false); // Đóng form sau khi lưu
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.includes('song')) {
      const updatedSongs = [...playlistData.songs];
      updatedSongs[index] = { title: value }; // Cập nhật tên bài hát
      setPlaylistData((prevData) => ({
        ...prevData,
        songs: updatedSongs,
      }));
    } else {
      setPlaylistData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Đóng form chỉnh sửa
  };

  return (
    <div className={`playlist-item ${isDeleted ? 'deleted' : ''}`}>
      <div className="playlist-content" onClick={handleClickPlayList}>
        <h3 className="playlist-item__title">{title}</h3>
        <p className="playlist-item__created-at">Ngày tạo: {formatDate(createAt)}</p>
        <p className="playlist-item__song-count">{songs.length} bài hát</p>
      </div>
      {isDeleted && <span className="playlist-item__deleted-badge">Đã xóa</span>}

      <button className="playlist-item__more-btn" onClick={() => setShowMenu(!showMenu)}>
        ...
      </button>
      {showMenu && (
        <div className="playlist-item__menu">
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}

      {/* Hiển thị form chỉnh sửa */}
      {isEditing && (
        <div className="playlist-item__overlay" />
      )}

      {isEditing && (
        <EditPlaylistForm
          playlistData={playlistData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

MyPlaylistItem.propTypes = {
  playlist: PropTypes.shape({
    title: PropTypes.string.isRequired,
    createAt: PropTypes.string.isRequired,
    songs: PropTypes.array.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    creator: PropTypes.object.isRequired,
    _id: PropTypes.string.isRequired,  // added _id to the playlist shape
  }).isRequired,
};

export default MyPlaylistItem;
