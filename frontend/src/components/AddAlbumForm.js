import React, { useContext, useEffect, useState } from 'react';
import './AddAlbumForm.css';
import { AuthContext } from '../context/AuthContext';
import { getSocket, sendNotifications } from '../services/socketService'; 
const ETypeNotify = require("../enums/ETypeNotify");

const AddAlbumForm = ({ setIsAddingAlbum }) => {
  const socket = getSocket();
  const { authState } = useContext(AuthContext);
  const { accessToken, user } = authState;
  // Lấy creator từ localStorage
  const storedUserData = JSON.parse(localStorage.getItem('userdata'));
  const creator = storedUserData?._id || '';

  // State quản lý dữ liệu album
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    songs: '',
    desc: '',
    linkImg: '',
  });

  // State loading và error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (socket) {
      console.log("Socket instance in AddAlbumForm component:", socket);

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
  const handleAddAlbum = async () => {
    if (!newAlbum.title || !newAlbum.songs || !newAlbum.desc || !newAlbum.linkImg) {
      alert('Please fill in all the fields!');
      return;
    }
  
    const formattedSongs = newAlbum.songs.split(',').map((song) => song.trim());
  
    const albumData = {
      creator,
      title: newAlbum.title,
      songs: formattedSongs,
      desc: newAlbum.desc,
      linkImg: newAlbum.linkImg,
    };
  
    try {
      setIsLoading(true);
      setError('');
  
      const response = await fetch('http://localhost:5000/api/albums/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(albumData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create album');
      }
  
      const album = await response.json();
      console.log('Album created:', album);
  
      // Đợi fetchFollowers hoàn tất và lấy danh sách followers
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
      const type = ETypeNotify.NEW_ALBUM;
      const objectId = album._id;
      createNotifications(senderId, fetchedFollowers, objectId, senderFullName, type);
      alert('Album created successfully!');
      setIsAddingAlbum(false);
    } catch (err) {
      console.error('Error creating album:', err);
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
          content: `${senderFullName} đã thêm một album mới`,
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
      <h2>Add New Album</h2>

      {/* Input Title */}
      <input
        type="text"
        placeholder="Album Title"
        value={newAlbum.title}
        onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
      />

      {/* Input Songs */}
      <input
        type="text"
        placeholder="Songs (comma-separated)"
        value={newAlbum.songs}
        onChange={(e) => setNewAlbum({ ...newAlbum, songs: e.target.value })}
      />

      {/* Input Description */}
      <textarea
        placeholder="Description"
        value={newAlbum.desc}
        onChange={(e) => setNewAlbum({ ...newAlbum, desc: e.target.value })}
      />

      {/* Input Link Image */}
      <input
        type="text"
        placeholder="Image Link"
        value={newAlbum.linkImg}
        onChange={(e) => setNewAlbum({ ...newAlbum, linkImg: e.target.value })}
      />

      {/* Error */}
      {error && <p className="error-message">{error}</p>}

      {/* Buttons */}
      <div className="button-group">
        <button onClick={handleAddAlbum} className="btn-add" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add'}
        </button>
        <button onClick={() => setIsAddingAlbum(false)} className="btn-cancel" disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddAlbumForm;
