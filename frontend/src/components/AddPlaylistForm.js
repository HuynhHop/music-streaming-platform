import React, { useState, useContext, useEffect } from 'react';
// import './AddPlaylistForm.css';
import { AuthContext } from '../context/AuthContext';
import { getSocket, sendNotifications } from '../services/socketService'; 
const ETypeNotify = require("../enums/ETypeNotify");

const AddPlaylistForm = ({ setIsAddingPlaylist }) => {
  const socket = getSocket();
  const { authState } = useContext(AuthContext);
  const { accessToken, user } = authState;
  const [playlist, setPlaylist] = useState({});
  const creatorId = user?._id || ''; 

  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (socket) {
      console.log("Socket instance in AddPlayLít component:", socket);

      if (socket.connected) {
        console.log("Socket is connected.");
      } else {
        console.error("Socket is not connected.");
      }

    } else {
      console.error("Socket is undefined or null.");
    }
  }, [socket]);

  // Hàm xử lý khi nhấn Add
  const handleAddPlaylist = async () => {
    if (!newPlaylist.title.trim()) {
      alert('Please enter a playlist title!');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Gửi API
      const response = await fetch(`http://localhost:5000/api/playlists/creator/${creatorId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title: newPlaylist.title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const playlist = await response.json();
      console.log('Playlist created:', playlist);
      const fetchedFollowers = await (async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/follows/followers/${user._id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch followers');
          }
  
          const data = await response.json();
          console.log('Fetched Followers:', data.followers);
          return data.followers || [];
        } catch (err) {
          console.error('Error fetching followers:', err);
          return [];
        }
      })();
  
      const senderId = user._id;
      const senderFullName = user.fullname;
      const type = ETypeNotify.NEW_PLAYLIST;
      const objectId = playlist._id;
      console.log("Playlist ID:", objectId);
      createNotifications(senderId, fetchedFollowers, objectId, senderFullName, type);
      alert('Playlist created successfully!');
      setIsAddingPlaylist(false); // Đóng form sau khi thêm thành công
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createNotifications = async (senderId, receivers, objectId, senderFullName, type) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/notifies/bulk`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: receivers,
          objectId,
          content: `${senderFullName} đã thêm một playlist mới`,
          type,
        }),
      });

      if (response.ok) {
        console.log("Sending notifications to followers:", receivers);
        sendNotifications({ senderId, receivers});
        console.log("Notifications created successfully.");
      } else {
        console.error("Error creating notification:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return (
    <div className="add-form">
      <h2>Add New Playlist</h2>

      {/* Input Title */}
      <input
        type="text"
        placeholder="Playlist Title"
        value={newPlaylist.title}
        onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
      />

      {/* Error */}
      {error && <p className="error-message">{error}</p>}

      {/* Buttons */}
      <div className="button-group">
        <button onClick={handleAddPlaylist} className="btn-add" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add'}
        </button>
        <button onClick={() => setIsAddingPlaylist(false)} className="btn-cancel" disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddPlaylistForm;
