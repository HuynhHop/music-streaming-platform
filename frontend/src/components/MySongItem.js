import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import EditSongForm from './EditSongForm'; // A separate component for editing the song
import './MySongItem.css';

const MySongItem = ({ song, onEdit, onDelete }) => {
  const { title, artist, createAt, totalPlays, isDeleted, type, descs, lyrics, creator, linkImg, linkSong, updateAt, isBlocked, _id } = song; // Use _id here instead of id for consistency
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [songData, setSongData] = useState({ ...song });
  const [imageSrc, setImageSrc] = useState('');

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleEditClick = () => {
    setShowMenu(false);
    setIsEditing(true); // Open the edit form
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this song?')) {
      if (onDelete) onDelete(_id); // Use _id for consistency
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onEdit) onEdit(_id, songData); // Pass new data to onEdit callback
    setIsEditing(false); // Close form after saving
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSongData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Close edit form
  };

  const handleSongClick = () => {
    console.log(_id); // Log the song ID
    navigate(`/song/${_id}`, { state: { song } }); // Navigate to the song detail page with the song ID
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const fetchImage = async () => {
      if (song?.linkImg) {
          console.log('linkImg:', song.linkImg); // In ra linkImg
          try {
              const response = await fetch(song.linkImg, {
                method: 'GET',  
                headers: {
                      'Authorization': `Bearer ${accessToken}`, // Thêm token vào header
                      'Content-Type': 'application/json',
                  }
              });
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              setImageSrc(url);
          } catch (error) {
              console.error('Error fetching the image:', error);
          }
      }
  };

    fetchImage();
  }, [song?.linkImg]);

  return (
    <div className={`song-item ${isDeleted ? 'deleted' : ''}`} >
      <div className="song-item__image-container" onClick={handleSongClick}>
        <img
          className="song-item__image"
          src={imageSrc} // Ensure the image link is valid
          alt={title}
        />
      </div>
      <h3 className="song-item__title">{title}</h3>
      <p className="song-item__artist">Artist: {artist?.fullName || "Thông tin không có sẵn"}</p>

      {isDeleted && <span className="song-item__deleted-badge">Deleted</span>}

      <button className="song-item__more-btn" onClick={() => setShowMenu(!showMenu)}>
        ...
      </button>
      {showMenu && (
        <div className="song-item__menu">
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}

      {/* Show edit form */}
      {isEditing && (
        <div className="song-item__overlay" />
      )}

      {isEditing && (
        <EditSongForm
          songData={songData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

MySongItem.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    artist: PropTypes.shape({
      fullName: PropTypes.string.isRequired,
    }).isRequired,
    descs: PropTypes.string,
    lyrics: PropTypes.string,
    creator: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    linkImg: PropTypes.string.isRequired,
    linkSong: PropTypes.string.isRequired,
    createAt: PropTypes.string.isRequired,
    updateAt: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    isBlocked: PropTypes.bool.isRequired,
    totalPlays: PropTypes.number.isRequired,
    _id: PropTypes.string.isRequired, // Updated to _id
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default MySongItem;
