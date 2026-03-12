import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import nonAvatar from '../public/images/non-avatar.svg';
import NotifyDropdown from './NotifyDropdown'; 
import SearchBar from './SearchBar'; 
import './Header.css';
import { AuthContext } from '../context/AuthContext';
import { getSocket } from '../services/socketService'; 
const ETypeRole = require("../enums/ETypeRole");
const ETypeNotify = require("../enums/ETypeNotify");
const NotificationService = require('../services/NotificationService');

const Header = () => {
  const socket = getSocket();
  const { authState, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { user } = authState;
    const fetchNotifications = async () => {
      const { accessToken } = authState;
      try {
        const response = await fetch(`http://localhost:5000/api/notifies/user/${user._id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setNotifications(data);
          } else {
            console.error("Error: No notifications found.");
          }
        } else {
          console.error("Error getting notifications:", response.statusText);
        }
      } catch (error) {
        console.error("Error getting notifications:", error);
      }
    };

    fetchNotifications();

    if (socket) {
      console.log("Socket instance in Header component:", socket);

      if (socket.connected) {
        console.log("Socket is connected.");
      } else {
        console.error("Socket is not connected.");
      }

      socket.on("getNotification", () => {
        fetchNotifications();
      });
    } else {
      console.error("Socket is undefined or null.");
    }

    return () => {
      if (socket) {
        socket.off("getNotification");
      }
    };
  }, [authState]);

  const setReadHandle = async (notifyId) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/notifies/is-read/${notifyId}`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error setting notification as read:", error);
    }
  };
  
  const getAlbumById = async (albumId) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/albums/${albumId}`, {  // Change `id` to `albumId` here
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const album = await response.json();
        return album;
      } else {
        console.error("Error getting album:", response.statusText);
        alert("Album không còn tồn tại");
      }
    } catch (error) {
      console.error("Error getting album:", error);
    }
  }

  const getSongById = async (songId) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/songs/${songId}`, {  // Change `id` to `songId` here
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const song = await response.json();
        return song;
      } else {
        console.error("Error getting song:", response.statusText);
        alert("Bài hát không còn tồn tại");
      }
    } catch (error) {
      console.error("Error getting song:", error);
    }
  }

  const getPlaylistId = async (playlistId) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, { 
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const playlist = await response.json();
        return playlist;
      } else {
        console.error("Error getting playlist:", response.statusText);
        alert("Playlist không còn tồn tại");
      }
    } catch (error) {
      console.error("Error getting playlist:", error);
    }
  }

  const getUserById = async (userId) => {
    const { accessToken } = authState;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = await data.user;
        return user;
      } else {
        console.error("Error getting user:", response.statusText);
        alert("Người dùng không còn tồn tại");
      }
    } catch (error) {
      console.error("Error getting user:", error);
    }
  }

  const handleClick = (notification) => {
    console.log("Notification clicked:", notification);
    setReadHandle(notification._id);
    if(notification.type === ETypeNotify.COMMENT || notification.type === ETypeNotify.NEW_SONG || notification.type === ETypeNotify.LIKE) 
      NotificationService.handleNotification(notification, navigate, getSongById); 
    else if (notification.type === ETypeNotify.NEW_ALBUM) {
      NotificationService.handleNotification(notification, navigate, getAlbumById); 
    } else if (notification.type === ETypeNotify.NEW_PLAYLIST) {
      NotificationService.handleNotification(notification, navigate, getPlaylistId); 
    } else if (notification.type === ETypeNotify.FOLLOW) {
      NotificationService.handleNotification(notification, navigate, getUserById); 
    }
  };

  const handleLogout = () => {
    logout();
  };

  const { role, user } = authState;

  return (
    <header className="header">
      <h1 className="logo">Share Music</h1>

      {role === ETypeRole.USER && (
        <div className="search-bar-container">
          <SearchBar />
        </div>
      )}

      <nav className="menu">
        {role === ETypeRole.USER && (
          <div className="user-dashboard">
            <div className="menu-item">
              <Link to="/user-dashboard" className="link">Trang chủ</Link>
            </div>

            <div className="menu-item">
              <Link to="/personal-music" className="link">Cá Nhân</Link>
            </div>
          </div>
        )}

        {role === ETypeRole.ADMIN && (
          <div className="menu-item">
            <Link to="/admin-dashboard" className="link">Quản lý</Link>
          </div>
        )}

        {user !== null ? (
          <div className="avatar-menu menu-item">
            {role === ETypeRole.USER && (
              <NotifyDropdown 
                notifications={notifications} 
                handleClick={handleClick} />
            )}
            <div className="profile dropdown">
              <Link to="/profile" className="link">
                <img
                  src={nonAvatar}
                  alt="Avatar"
                  className="avatar"
                />
              </Link>
              <div className="dropdown-menu">
                <Link to="/profile" className="link dropdown-menu-item">Trang cá nhân</Link>
                <button onClick={handleLogout} className="link dropdown-menu-item btnLogout">Đăng xuất</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="menu-item">
            <Link to="/login" className="link btnLogin">Đăng nhập</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
