import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './SongInfo.css';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaList, FaPlusCircle, FaRegFlag, FaShare } from 'react-icons/fa';
import CommentSection from './CommentSection';
import Queue from './Queue'; // Import Playlist Component
import PlaylistForm from './PlaylistForm'; // Import PlaylistForm component
import ReportForm from './ReportForm'; // Import PlaylistForm component
import { sendNotify } from "../services/socketService";
import { getSocket } from '../services/socketService'; 
import ShareForm from '../components/ShareForm';
const ETypeNotify = require("../enums/ETypeNotify");


const SongInfo = ({ onLikeClick }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { song: initialSong } = location.state || { playlist: null }
  const [song, setSong] = useState(initialSong);
  const socket = getSocket();
  const { authState } = useContext(AuthContext);
  const { accessToken, user, role } = authState;
  const artist = song?.artist;
  
  const shareLink = window.location.href;

  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [loading, setLoading] = useState(true);

  const getSongById = async (songId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/songs/${songId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const song = await response.json();
        setSong(song); 
      } else {
          console.error("Error getting song:", response.statusText);
      }
    } catch (error) {
      console.error('Error fetching song:', error);
    }
  };
  
  // Fetch favorites from API
  const fetchFavorite = async () => {
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
      const firstFavorite = data[0];
      console.log('Favorites:', firstFavorite);
      setFavorite(firstFavorite); 
      setIsLoved(firstFavorite.songs.some((s) => s._id === song._id));
      console.log('Is loved:', isLoved);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFavoriteSong = async () => {
    if(isLoved) {
      deleteSongFromFavorite();
    } else {
      addSongIntoFavorite();
    }
  }
  
  
    // Add song to favorite
  const addSongIntoFavorite = async () => {
    try {
      console.log('Favorite:', favorite);
      const response = await fetch(`http://localhost:5000/api/favorites/${favorite._id}/song`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songTitle: song.title }), // Truyền songTitle thay vì songId
      });

      if (!response.ok) {
        throw new Error('Failed to add song to favorite');
      } 
      setIsLoved(true);
      console.log(`Song added to favorite with ID: ${favorite._id}`);
      
      const senderId = user._id;
      const senderfullName = user.fullname;
      const receiverId = song.creator._id;
      const type = ETypeNotify.LIKE;
      const objectId = song._id;
      console.log("Create notification like");
      createNotification(senderId, receiverId, objectId, senderfullName, type);
    } catch (error) {
      console.error('Error adding song to favorite:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const deleteSongFromFavorite = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please log in again.');
      }

      const response = await fetch(
        `http://localhost:5000/api/favorites/${favorite._id}/song/${song._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setIsLoved(false);
        console.log('Song deleted from favorite:', song._id);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete song from favorite');
      }
    } catch (error) {
      console.error('Error deleting song from favorite:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!song || song._id !== id) {
      setLoading(true);
      console.error('Không có bài hát!');
      getSongById(id); 
    } else {
      if (socket) {
        console.log("Socket instance in SongInfo component:", socket);
  
        if (socket.connected) {
          console.log("Socket is connected.");
        } else {
          console.error("Socket is not connected.");
        }
  
        // Lắng nghe sự kiện 'fetchComment' và lấy bình luận mới
        socket.on("fetchComment", () => {
          fetchComments(song._id); // Gọi fetchComments với song._id
        });
      } else {
        console.error("Socket is undefined or null.");
      }
  
      // Cleanup khi component unmount hoặc song thay đổi
      return () => {
        if (socket) {
          socket.off("fetchComment"); // Tắt lắng nghe sự kiện 'fetchComment'
        }
      };
    }
  }, [song, socket, id]);

  useEffect(() => {
    const loadFavorite = async () => {
      await fetchFavorite(); 
    };
  
    if (!favorite) {
      loadFavorite();
    }
  }, [favorite, fetchFavorite, song._id]);

  // State for image
  const [imageSrc, setImageSrc] = useState("");
  const [audio, setAudio] = useState(null);

  // Queue state
  const [showQueue, setShowQueue] = useState(false);
  const [currentQueue, setCurrentQueue] = useState([song]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [comments, setComments] = useState([]);
  
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); 
  const [playlists, setPlaylists] = useState([
    { id: 1, name: 'Playlist 1', songs: [] },
    { id: 2, name: 'Playlist 2', songs: [] },
    { id: 3, name: 'Playlist 2', songs: [] },
    { id: 4, name: 'Playlist 2', songs: [] },
    { id: 5, name: 'Playlist 2', songs: [] },
    { id: 6, name: 'Playlist 2', songs: [] },]);
  const [volume, setVolume] = useState(1);


  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const fetchImage = async () => {
      if (song?.linkImg) {
        try {
          const response = await fetch(song.linkImg, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
        } catch (error) {
          console.error("Error fetching the image:", error);
        }
      }
    };

    const fetchAudio = async () => {
      if (song?.linkSong) {
        try {
          const response = await fetch(song.linkSong, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const audioUrl = URL.createObjectURL(await response.blob());
          const newAudio = new Audio(audioUrl);
          newAudio.onloadedmetadata = () => {
            setDuration(newAudio.duration);
            console.log("Audio Duration:", newAudio.duration);
          };
          setAudio(newAudio);
        } catch (error) {
          console.error("Error fetching the audio:", error);
        }
      }
      setLoading(false);
    };

    if (song || song._id !== id) {
      fetchAudio();
      fetchImage();
    } else {
      setLoading(false);
    }

  }, [song]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause(); // Dừng nhạc khi component bị hủy
      }
    };
  }, [audio]);

  // Dừng nhạc khi URL thay đổi
  useEffect(() => {
    if (audio) {
      audio.pause(); // Dừng nhạc khi URL thay đổi
    }
  }, [location]); // Theo dõi sự thay đổi của location

  useEffect(() => {
    let intervalId;

    if (isPlaying && audio) {
      intervalId = setInterval(() => {
        setCurrentTime(audio.currentTime);
      }, 1000); // Cập nhật mỗi giây
    }

    return () => {
      clearInterval(intervalId); // Dọn dẹp interval khi component unmount hoặc khi âm thanh dừng
    };
  }, [isPlaying, audio]);

  const handleSliderChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    if (audio) {
      audio.currentTime = newTime;
    }
  };
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume; // Cập nhật âm lượng
    }
  };

  const handlePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    } else {
      console.warn("Audio is not initialized.");
    }
  };
  const handleNextSong = () => {};
  const handlePrevSong = () => {};

  useEffect(() => {
    if(song)
      fetchComments(song._id);
  }, [song]);

  const fetchComments = async (songId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/comments/song/${songId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          setComments(data); 
        } else {
          setComments([]);
          console.error('Expected an array, but got:', data);
        }
      } catch (error) {
          console.error('Error while fetching comments:', error);
          setComments([]);
      }
  };

  const createNewComment = async (content, userId, songId) => {
      try {
          const response = await fetch('http://localhost:5000/api/comments', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  userId: userId, 
                  songId: songId, 
                  content: content, 
              }),
          });

          const result = await response.json(); 
          
          const newComment = result.comment; 
          setComments([...comments, newComment]);
          if (response.ok) {
              console.log('Comment added successfully:', result);
              const senderId = user._id;
              const senderfullName = user.fullname;
              const receiverId = song.creator._id;
              const type = ETypeNotify.COMMENT;
              const objectId = song._id;
              console.log("Create notification comment");
              createNotification(senderId, receiverId, objectId, senderfullName, type);
          } else {
              console.error('Failed to add comment:', result.message);
          }
      } catch (error) {
          console.error('Error while adding comment:', error);
      }
  };

  const createNotification = async (senderId, receiverId, objectId, senderFullName, type) => {
    const { accessToken } = authState;
    const content = (type === ETypeNotify.COMMENT)?
                  `${senderFullName} đã bình luận về bài hát của bạn`:
                  `${senderFullName} đã thích bài hát của bạn`;
    try {
      const response = await fetch(`http://localhost:5000/api/notifies`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: receiverId,
          objectId,
          "content": content,
          type,
        }),
      });

      if (response.ok) {
        sendNotify({ senderId, receiverId });
        console.log("Notification created successfully.");
      } else {
        console.error("Error creating notification:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const updateComment = async (commentId, newContent) => {
    try {
        const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: newContent,
            }),
        });

        if (!response.ok) {
          throw new Error('Failed to update comment');
        }
  
        const updatedComment = await response.json();

        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: updatedComment.content }
              : comment
          )
        );
      } catch (error) {
          console.error('Error while updating comment:', error);
      }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
  
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error('Error while deleting comment:', error);
    }
  };
  
  
  const handleAddComment = (content) => {
    createNewComment(content, user._id, song._id);
  };

  const handleEditComment = (commentId, newContent) => {
    updateComment(commentId, newContent); 
  }

  const handleDeleteComment = (commentId) => {
    deleteComment(commentId)
  }

  const handleSelectSong = (song) => {
    console.log("Selected Song: ", song);
    setShowQueue(false); 
  };

  const togglePlaylist = () => {
    setShowQueue(!showQueue);
  };

  const toggleQueueModal = () => {
    setShowQueue(!showQueue); 
  };

  const togglePlaylistModal = async () => {
    setShowPlaylistModal(!showPlaylistModal); // Toggle trạng thái modal
    if (!showPlaylistModal) {
      try {
        const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
        const userdata = JSON.parse(localStorage.getItem('userdata')); // Lấy thông tin người dùng
        const creatorId = userdata?._id; // Giả sử ID creator nằm trong userdata
        
        if (!creatorId) {
          console.error('Không tìm thấy Creator ID');
          return;
        }
  
        // Gọi API để lấy danh sách playlist của creator
        const response = await fetch(`http://localhost:5000/api/playlists/creator/${creatorId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Thêm token vào header
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách playlist');
        }
  
        const data = await response.json();
        setPlaylists(data); // Cập nhật danh sách playlist
      } catch (error) {
        console.error('Lỗi khi lấy danh sách playlist:', error);
      }
    }
  };

  const handleAddToPlaylist = (playlistId) => {
    const selectedPlaylist = playlists.find(
      (playlist) => playlist._id === playlistId
    );
    if (selectedPlaylist && song) {
      selectedPlaylist.songs.push(song);
      setPlaylists([...playlists]);
    }
    setShowPlaylistModal(false);
  };

  const handleCreateNewPlaylist = (newPlaylistName, song) => {
    const newPlaylist = {
      id: playlists.length + 1,
      name: newPlaylistName,
      songs: [song], 
    };
    setPlaylists([...playlists, newPlaylist]);
    setShowPlaylistModal(false); 
  };

  const handleRemoveFromQueue = (songId) => {
    setCurrentQueue(currentQueue.filter((song) => song.id !== songId));
  };

  const createNewReport = async (userId, songId, reason, content) => {
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          songId: songId,
          reason: reason,
          content: content,
        }),
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Song or User not found');
        } else if (response.status === 401) {
          throw new Error('Unauthorized, please check your token');
        } else {
          throw new Error('Failed to create report');
        }
      }
  
      const newReport = await response.json();
      console.log('New report:', newReport);
    } catch (error) {
      console.error('Error while creating report:', error.message);
    }
  };
  
  const handleReportSubmit = (reason, content) => {
    console.log("Report submitted:", reason, content);
    
    if (user && song) {
      createNewReport(user._id, song._id, reason, content);
    } else {
      console.error('Invalid user or song data');
    }
    
    setShowReportForm(false); 
  };

  const toggleReportForm = () => {
    setShowReportForm(!showReportForm);
  };

  const toggleShareForm = () => {
    setShowShareForm(!showShareForm);
  };

  const handleCloseShareForm = () => {
    setShowShareForm(false);
  };

  if (!song) {
    return <div>Không tìm thấy bài hát. Vui lòng thử lại!</div>;
  }

  return (
    <div className="song-info">
      {loading ? (
        <div className="loading" style={{minHeight:"100vh"}}>Đang tải...</div>
      ) : (
      <div className="song-info-container">
        <div className="song-info-header">
          <div className="song-info-layout">
            {/* Thông tin bài hát bên trái */}
            <div className="song-info-left">
              <div className="song-info-image-container">
                <img
                  src={imageSrc || song.linkImg || "/default-song-image.jpg"}
                  alt={song.title}
                  className="song-info-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-song-image.jpg";
                  }}
                />
              </div>
              <div className="song-info-details">
                <h1 className="song-info-title">
                  <button onClick={handleFavoriteSong} className="song-info-like-button">
                    <FaHeart style={{ color: isLoved ? 'red' : 'black' }}/>
                  </button>
                  {song?.title || "Tiêu đề không có sẵn"}
                  <button onClick={toggleShareForm} className="song-info-share-button">
                    <FaShare />
                  </button>
                </h1>
                <p className="song-info-artist">
                  <Link to={`/artist/${song.artist?._id}`} className="song-info-artist-link">
                    Ca sĩ: {song.artist?.fullName || "Thông tin không có sẵn"}
                  </Link>
                </p>
                <p className="song-info-type">Thể loại: {song?.type || "Thông tin không có sẵn"}</p>
              </div>
            </div>
  
            {/* Lyrics bên phải */}
            <div className="song-info-right">
              <div className="song-info-lyrics">
                <h3>Lời bài hát</h3>
                <pre className="song-info-lyrics-text">
                  {song?.lyrics || "Lời bài hát không có sẵn"}
                </pre>
              </div>
            </div>
          </div>
  
          {/* Control nhạc dưới */}
          <div className="song-info-controls">
            <button onClick={togglePlaylistModal} className="song-info-control-button outlet-button">
              <FaPlusCircle />
            </button>
            <button onClick={handlePrevSong} className="song-info-control-button">
              <FaStepBackward />
            </button>
            <button onClick={handlePlayPause} className="song-info-control-button">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={handleNextSong} className="song-info-control-button">
              <FaStepForward />
            </button>
            <button onClick={toggleQueueModal} className="song-info-control-button">
              <FaList />
            </button>
            <button onClick={toggleReportForm} className="song-info-control-button song-info-report-button">
              <FaRegFlag />
            </button>
          </div>
  
          {/* Thanh thời gian và điều chỉnh âm lượng */}
          <div className="song-info-time-slider-container">
            <span className="song-info-time">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
            <input
              type="range"
              value={currentTime}
              max={duration || 0} // Đảm bảo max không phải là NaN
              onChange={handleSliderChange}
              className="song-info-time-slider"
            />
            <span className="song-info-time">
              {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="song-info-volume-slider-container">
            <label htmlFor="volume" className="volume-label">Âm lượng:</label>
            <input
              type="range"
              id="volume"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="song-info-volume-slider"
            />
          </div>
        </div>
  
        {/* Phần bình luận và các modal */}
        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
        {showQueue && <Queue 
          songs={currentQueue} 
          onSelectSong={handleSelectSong} 
          onClose={toggleQueueModal}
          onRemoveSong={handleRemoveFromQueue} 
        />}
        {showPlaylistModal && (
          <PlaylistForm
            playlists={playlists}
            song={song}
            onAddToPlaylist={handleAddToPlaylist}
            onCreateNewPlaylist={handleCreateNewPlaylist}
            onClose={togglePlaylistModal}
          />
        )}
  
        {showReportForm && (
          <ReportForm onSubmit={handleReportSubmit} onClose={toggleReportForm} />
        )}
  
        {showShareForm && 
          <ShareForm shareLink={shareLink} onClose={handleCloseShareForm} />
        }
      </div>
      )}
    </div>
  );
  
};

export default SongInfo;
