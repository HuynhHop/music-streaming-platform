import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PersonalPage.css';
import MySongItem from '../components/MySongItem';
import MyAlbumItem from '../components/MyAlbumItem';
import MyPlaylistItem from '../components/MyPlaylistItem';
import AddSongForm from '../components/AddSongForm';
import AddAlbumForm from '../components/AddAlbumForm';
import AddPlaylistForm from '../components/AddPlaylistForm';
import AddFavoritesForm from '../components/AddFavoritesForm';
import FavoritesItem from '../components/FavoritesItem';
import { getSocket, sendNotifications } from '../services/socketService'; 
const ETypeNotify = require("../enums/ETypeNotify");

const PersonalPage = () => {
  const socket = getSocket();
  const { authState } = useContext(AuthContext);
  const { accessToken, user, role } = authState;
  console.log("AuthState: ", authState);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]); // State mới cho favorites
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);  
  const [newFavorite, setNewFavorite] = useState({ title: '', description: '' });
  const [pageFavorites, setPageFavorites] = useState(1);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);

  const [newSong, setNewSong] = useState({title: '', artist: null, type: '', description: '', lyrics: '', fileMP3: null, filePhoto: null});
  const [newAlbum, setNewAlbum] = useState({ title: '', description: '', creator: '' });
  const [newPlaylist, setNewPlaylist] = useState({ title: '', creator: '' });
  const [pageSongs, setPageSongs] = useState(1);
  const [pageAlbums, setPageAlbums] = useState(1);
  const [pagePlaylists, setPagePlaylists] = useState(1);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  const storedUserData = JSON.parse(localStorage.getItem('userdata'));
  const creatorId = storedUserData?._id || ''; // Get creator ID from user data

  const itemsPerPage = 4;

  useEffect(() => {
    if (!accessToken) {
      console.log("Không tìm thấy token");
      navigate('/login'); 
      return; 
    }

    if (!user) {
      console.log("Không có dữ liệu người dùng");
      navigate('/login'); 
      return;
    }

    
    if (socket) {
      console.log("Socket instance in Add Song component:", socket);

      if (socket.connected) {
        console.log("Socket is connected.");
      } else {
        console.error("Socket is not connected.");
      }

    } else {
      console.error("Socket is undefined or null.");
    }

    console.log("User: ", user._id);
    // Fetch songs từ API
    const fetchSongs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/songs/creator/${user._id}`, { // Dùng dấu `` cho template literal
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`, 
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        setSongs(data); 
      } catch (error) {
        console.error('Error fetching songs:', error);
        setLoading(false);
      }
    };

    const fetchAlbums = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/albums/creator/${user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }

        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/playlists/creator/${user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }

        const data = await response.json();
        setPlaylists(data); // Cập nhật state với dữ liệu playlist nhận được
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };
    // Fetch favorites from API
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/favorites/creator/${user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data); // Update state with favorites data
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    setLoading(false); // Đặt trạng thái loading là false sau khi tải xong dữ liệu
    fetchAlbums();
    fetchSongs(); // Gọi hàm fetch
    fetchPlaylists(); // Gọi hàm fetch playlists
    fetchFavorites();
  }, [accessToken, user, navigate, socket]);

  const paginateItems = (items, page, number) => {
    const startIndex = (page - 1) * number;
    return items.slice(startIndex, startIndex + number);
  };

  const handlePageChange = (direction, type) => {
    if (type === 'songs') {
      setPageSongs(prevPage => direction === 'next' ? prevPage + 1 : Math.max(1, prevPage - 1));
    } else if (type === 'albums') {
      setPageAlbums(prevPage => direction === 'next' ? prevPage + 1 : Math.max(1, prevPage - 1));
    } else if (type === 'playlists') {
      setPagePlaylists(prevPage => direction === 'next' ? prevPage + 1 : Math.max(1, prevPage - 1));
    }
  };

  const handleAddSong = async () => {
    const formData = new FormData();
  
    formData.append("title", newSong.title);
    formData.append("type", newSong.type);
    formData.append("artist", newSong.artist || "");
    formData.append("desc", newSong.description);
    formData.append("lyrics", newSong.lyrics || "");
    formData.append("creator", user._id); 
  
    if (newSong.fileMP3) {
      formData.append("fileMP3", newSong.fileMP3);
    }
    if (newSong.filePhoto) {
      formData.append("filePhoto", newSong.filePhoto);
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const song = await response.data;
      console.log("Thêm bài hát thành công:", song);

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
      const type = ETypeNotify.NEW_SONG;
      const objectId = song._id;
      createNotifications(senderId, fetchedFollowers, objectId, senderFullName, type);
  
      setNewSong({
        title: "",
        artist: "",
        type: "",
        description: "",
        lyrics: "",
        fileMP3: null,
        filePhoto: null,
      });
      setIsAddingSong(false);
    } catch (error) {
      console.error("Lỗi khi thêm bài hát:", error);
      alert("Đã xảy ra lỗi khi thêm bài hát.");
    }
  };  

  const createNotifications = async (senderId, receivers, objectId, senderFullName, type) => {
    const { accessToken } = authState;
    console.log("Song ID:", objectId);  
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
          content: `${senderFullName} đã thêm một bài hát mới`,
          type,
        }),
      });

      if (response.ok) {
        console.log("Notifications created successfully.", response.data);
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

  const handleAddAlbum = () => {
    const newAlbumItem = { 
      id: albums.length + 1, 
      title: newAlbum.title, 
      decs: newAlbum.description, 
      creator: { name: newAlbum.creator },
      createAt: new Date().toISOString(),
      songs: [],
      isDeleted: false,
      linkImg: 'https://via.placeholder.com/150',
    };
    setAlbums([...albums, newAlbumItem]);
    setIsAddingAlbum(false);
  };

  const handleAlbumClick = (object) => {
    navigate(`/album/${object._id}`, { state: { object } });
  }

  const handleAddPlaylist = () => {
    const newPlaylistItem = { 
      id: playlists.length + 1, 
      title: newPlaylist.title, 
      creator: { name: newPlaylist.creator },
      createAt: new Date().toISOString(),
      songs: [],
      isDeleted: false,
    };
    setPlaylists([...playlists, newPlaylistItem]);
    setIsAddingPlaylist(false);
  };

  const handlePlayListClick = (object) => {
    navigate(`/playlist/${object._id}`, { state: { object } });
  }

  
  const handleAddFavorite = () => {
    const newFavoriteItem = {
      id: favorites.length + 1,
      title: newFavorite.title,
      description: newFavorite.description,
      createAt: new Date().toISOString(),
    };
    setFavorites([...favorites, newFavoriteItem]);
    setIsAddingFavorite(false);
  };

  return (
    <div className="personal-page">
      <h2>My Personal Page</h2>

      {/* Displaying forms and buttons in the same row as the titles */}
      <section className="personal-page__section">
        <div className="section-header">
          <h3>My Songs</h3>
          <button
            onClick={() => { setIsAddingSong(true); setIsAddingAlbum(false); setIsAddingPlaylist(false); }}
            className={isAddingSong ? 'active' : ''}
          >
            Add Song
          </button>
        </div>
        {isAddingSong && (
          <AddSongForm 
            newSong={newSong} 
            setNewSong={setNewSong} 
            handleAddSong={handleAddSong} 
            setIsAddingSong={setIsAddingSong} 
          />
        )}
        <div className="my-song-list-container">
          {paginateItems(songs, pageSongs, itemsPerPage).map(song => (
            <MySongItem key={song.id} song={song} />
          ))}
        </div>
        <div className="pagination-controls">
          <button onClick={() => handlePageChange('prev', 'songs')} disabled={pageSongs === 1}>Previous</button>
          <button onClick={() => handlePageChange('next', 'songs')} disabled={songs.length <= pageSongs * itemsPerPage}>Next</button>
        </div>
      </section>

      <hr/>

      <section className="personal-page__section">
        <div className="section-header">
          <h3>My Albums</h3>
          <button
            onClick={() => { setIsAddingAlbum(true); setIsAddingSong(false); setIsAddingPlaylist(false); }}
            className={isAddingAlbum ? 'active' : ''}
          >
            Add Album
          </button>
        </div>
        {isAddingAlbum && (
          <AddAlbumForm 
            newAlbum={newAlbum} 
            setNewAlbum={setNewAlbum} 
            handleAddAlbum={handleAddAlbum} 
            setIsAddingAlbum={setIsAddingAlbum} 
          />
        )}
        <div className="my-album-list-container">
          {paginateItems(albums, pageAlbums, itemsPerPage).map(album => (
            <MyAlbumItem key={album.id} album={album} onClick={handleAlbumClick}/>
          ))}
        </div>
        <div className="pagination-controls">
          <button onClick={() => handlePageChange('prev', 'albums')} disabled={pageAlbums === 1}>Previous</button>
          <button onClick={() => handlePageChange('next', 'albums')} disabled={albums.length <= pageAlbums * itemsPerPage}>Next</button>
        </div>
      </section>

      <hr/>

      <section className="personal-page__section">
        <div className="section-header">
          <h3>My Playlists</h3>
          <button
            onClick={() => { setIsAddingPlaylist(true); setIsAddingSong(false); setIsAddingAlbum(false); }}
            className={isAddingPlaylist ? 'active' : ''}
          >
            Add Playlist
          </button>
        </div>
        {isAddingPlaylist && (
          <AddPlaylistForm 
            newPlaylist={newPlaylist} 
            setNewPlaylist={setNewPlaylist} 
            handleAddPlaylist={handleAddPlaylist} 
            setIsAddingPlaylist={setIsAddingPlaylist} 
          />
        )}
        <div className="my-playlist-list-container">
          
          {favorites.map(favorite => (
            <FavoritesItem key={favorite.id} favorite={favorite} />
          ))}
          {paginateItems(playlists, pagePlaylists, 3).map(playlist => (
            <MyPlaylistItem key={playlist.id} playlist={playlist}  onClick={handlePlayListClick}/>
          ))}
        </div>
        <div className="pagination-controls">
          <button onClick={() => handlePageChange('prev', 'playlists')} disabled={pagePlaylists === 1}>Previous</button>
          <button onClick={() => handlePageChange('next', 'playlists')} disabled={playlists.length <= pagePlaylists * itemsPerPage}>Next</button>
        </div>
      </section>
    </div>
  );
};

export default PersonalPage;