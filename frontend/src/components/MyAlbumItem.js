import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditAlbumForm from './EditAlbumForm'; // Import EditAlbumForm
import './MyAlbumItem.css';

const MyAlbumItem = ({ album, onEdit, onDelete, onClick }) => {
  const { title, createAt, songs, isDeleted, creator, decs, linkImg } = album;

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [albumData, setAlbumData] = useState({
    title,
    decs,
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

  const handleDeleteClick = async () => {
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Lấy access token từ localStorage
        if (!accessToken) {
          throw new Error("Access token is missing. Please log in again.");
        }
  
        const response = await fetch(`http://localhost:5000/api/albums/${album._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to delete the album");
        }
  
        alert(data.message); // Hiển thị thông báo thành công
        if (onDelete) onDelete(album._id); // Gọi callback để cập nhật UI
      } catch (error) {
        console.error("Error deleting album:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };
  

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onEdit) onEdit(album.id, albumData); // Gọi callback chỉnh sửa với dữ liệu mới
    setIsEditing(false); // Đóng form sau khi lưu
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.includes('song')) {
      const updatedSongs = [...albumData.songs];
      updatedSongs[index] = { title: value }; // Cập nhật tên bài hát
      setAlbumData((prevData) => ({
        ...prevData,
        songs: updatedSongs,
      }));
    } else {
      setAlbumData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Đóng form chỉnh sửa
  };

  const handleClickAlbum = () => {
    if (onClick) onClick(album); // Gọi callback khi nhấn vào album
  };

  return (
    <div className={`album-item ${isDeleted ? 'deleted' : ''}`}>
      <div className='album-content' onClick={handleClickAlbum}>
      <div className="album-item__image">
        <img src={linkImg} alt={title} />
      </div>
      <h3 className="album-item__title">{title}</h3>
      <p className="album-item__description">{decs}</p>
      <p className="album-item__song-count">{songs.length} bài hát</p>
      </div>
      {isDeleted && <span className="album-item__deleted-badge">Đã xóa</span>}

      <button className="album-item__more-btn" onClick={() => setShowMenu(!showMenu)}>
        ...
      </button>
      {showMenu && (
        <div className="album-item__menu">
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}

      {/* Hiển thị form chỉnh sửa */}
      {isEditing && (
        <div className="album-item__overlay" />
      )}

      {isEditing && (
        <EditAlbumForm
          albumId={album._id}
          albumData={albumData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

MyAlbumItem.propTypes = {
  album: PropTypes.shape({
    title: PropTypes.string.isRequired,
    createAt: PropTypes.string.isRequired,
    songs: PropTypes.array.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    creator: PropTypes.object.isRequired,
    decs: PropTypes.string.isRequired,
    linkImg: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func,  // Thêm onClick vào prop types
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default MyAlbumItem;
