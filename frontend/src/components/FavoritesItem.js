import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditFavoritesForm from './EditFavoritesForm';
import { useNavigate } from 'react-router-dom';
import './FavoritesItem.css'; // Shared CSS file with Playlist

const FavoritesItem = ({ favorite, onEdit, onDelete }) => {
  const { title, description, createAt, isDeleted, songs = [], _id } = favorite; // Default songs to an empty array if not provided

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [favoriteData, setFavoriteData] = useState({
    _id,
    title,
    description,
    songs,
  });
  const navigate = useNavigate();

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleEditClick = () => {
    setShowMenu(false);
    setIsEditing(true); // Show edit form
  };

  const handleDeleteClick = async () => {
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this favorite?')) {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Get access token
        if (!accessToken) {
          throw new Error("Access token is missing. Please log in again.");
        }

        const response = await fetch(`http://localhost:5000/api/favorites/${_id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to delete the favorite");
        }

        alert(data.message); // Show success message
        if (onDelete) onDelete(_id); // Callback to update UI
      } catch (error) {
        console.error("Error deleting favorite:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onEdit) onEdit(favorite._id, favoriteData); // Call edit callback with updated data
    setIsEditing(false); // Close the form after submit
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFavoriteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Close edit form without saving
  };

  const handleNavigate = () => {
    navigate(`/favorite`, { state: { favoriteData } });
  };

  return (
    <div className={`favorites-item ${isDeleted ? 'deleted' : ''}`}>
      <div className="favorites-content"
      onClick={handleNavigate}>
        <h3 className="favorites-item__title">
          {title}
          ❤️
        </h3>
        <p className="favorites-item__song-count">{songs.length} bài hát</p> {/* Display song count */}
        <p className="favorites-item__description">{description}</p>
      </div>

      {isDeleted && <span className="favorites-item__deleted-badge">Deleted</span>}

      <button className="favorites-item__more-btn" onClick={() => setShowMenu(!showMenu)}>
        ...
      </button>
      {showMenu && (
        <div className="favorites-item__menu">
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}

      {/* Show edit form */}
      {isEditing && (
        <div className="favorites-item__overlay" />
      )}

      {isEditing && (
        <EditFavoritesForm
          favoriteData={favoriteData} // Use favoriteData, not playlistData
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

FavoritesItem.propTypes = {
  favorite: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    createAt: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    songs: PropTypes.array, // Add songs as an optional array
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default FavoritesItem;
