// import React, { useState, useEffect, useContext} from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { FaUserPlus, FaUserMinus, FaUsers, FaMusic } from "react-icons/fa";
// import "./UserInfo.css";
// import { AuthContext } from '../context/AuthContext';
// import { sendNotify } from "../services/socketService";
// import { getSocket } from '../services/socketService'; 
// import SongList from "../components/SongUser/SongList";
// const ETypeNotify = require("../enums/ETypeNotify");

// const UserInfo = () => {
//   const socket = getSocket();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { authState } = React.useContext(AuthContext);
//   const { user } = authState;

//   const [userData, setUserData] = useState({});
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followers, setFollowers] = useState([]); // Danh sách followers
//   const [followings, setFollowings] = useState([]); // Danh sách đang theo dõi
//   const [showFollowers, setShowFollowers] = useState(false); // Trạng thái hiển thị followers
//   const [showFollowings, setShowFollowings] = useState(false); // Trạng thái hiển thị followings
//   const [loading, setLoading] = useState(false); // Quản lý trạng thái loading

//   const [songs, setSongs] = useState([]); // State to store songs
//   const [showSongs, setShowSongs] = useState(false); // Toggle songs display

//   const [songss, setSongsAlbum] = useState([]); // State to store songs
//   const [showSongsAlbum, setShowSongsAlbum] = useState(false); // Toggle songs display

//   const [albums, setAlbums] = useState([]);  // State to store albums
//   const [showAlbums, setShowAlbums] = useState(false); // Toggle albums display

//   const [imageMap, setImageMap] = useState({}); // State lưu các ảnh của bài hát

//   const accessToken = localStorage.getItem('accessToken');

//   // Fetch ảnh cho các bài hát
//   const fetchImages = async (songs) => {
//     const newImageMap = {};
//     for (const song of songss) {
//       if (song?.linkImg) {
//         try {
//           const response = await fetch(song.linkImg, {
//             method: 'GET',
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           });
//           if (response.ok) {
//             const blob = await response.blob();
//             newImageMap[song._id] = URL.createObjectURL(blob); // Lưu URL của ảnh
//           }
//         } catch (error) {
//           console.error(`Error fetching image for song ${song.title}:`, error);
//         }
//       }
//     }
//     setImageMap(newImageMap); // Cập nhật ảnh vào state
//   };
//   useEffect(() => {
//     if (songss && songss.length > 0) {
//       fetchImages(songss); // Gọi fetchImages khi có danh sách bài hát
//     }
//     if (location.state && location.state.user) {
//       const otherUser = location.state.user;
//       const formattedBirthday = new Date(otherUser.birthday).toLocaleDateString("en-GB");

//       if(user._id === otherUser._id) {
//         navigate('/profile');
//       }

//       setUserData({
//         fullName: otherUser.fullname,
//         email: otherUser.email,
//         phone: otherUser.phone,
//         gender: otherUser.gender,
//         birthday: formattedBirthday,
//         desc: otherUser.desc,
//         targetUserId: otherUser._id, // Lấy targetUserId từ dữ liệu user
//       });

//       // Kiểm tra trạng thái follow ban đầu
//       checkFollowStatus(otherUser._id);

//       if(socket){
//         console.log("Socket instance in UserInfor component:", socket);
  
//         if (socket.connected) {
//           console.log("Socket is connected.");
//         } else {
//           console.error("Socket is not connected.");
//         }
//       }
//     }
//   }, [location.state, socket, songss]);

//   const viewSongs = async () => {
//     const userToken = localStorage.getItem("accessToken");
//     console.log("targetId: ", userData.targetUserId)
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/songs/creator/${userData.targetUserId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${userToken}`,
//           },
//         }
//       );
//       const data = await response.json();
//       console.log("Fetched songs:", data);
//       setSongs(data); // Set fetched songs
//       console.log("Songs state:", songs);
//       setShowSongs(true); // Display the songs
//     } catch (error) {
//       console.error("Error fetching songs:", error);
//     }
//   };

//   const viewAlbums = async () => {
//     const userToken = localStorage.getItem("accessToken");
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/albums/creator/${userData.targetUserId}`,  // Adjust the endpoint accordingly
//         {
//           headers: {
//             Authorization: `Bearer ${userToken}`,
//           },
//         }
//       );
//       const data = await response.json();
//       console.log("Fetched albums:", data);
//       setAlbums(data); // Set fetched albums
//       setShowAlbums(true); // Display the albums
//     } catch (error) {
//       console.error("Error fetching albums:", error);
//     }
//   };

//   const viewAlbumDetails = (albumId) => {
//     // Fetch songs for the selected album
//     const album = albums.find((album) => album._id === albumId);
//     setSongsAlbum(album.songs); // Set songs for the selected album
//     setShowSongsAlbum(true); // Show the songs of the selected album
//   };
//   // Kiểm tra trạng thái follow
//   const checkFollowStatus = async (targetUserId) => {
//     const userToken = localStorage.getItem("accessToken");
//     try {
//       const response = await fetch(`http://localhost:5000/api/follows/status/${targetUserId}`, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
//       const data = await response.json();
//       if (data.success) {
//         setIsFollowing(data.isFollowing);
//       }
//     } catch (error) {
//       console.error("Error checking follow status:", error);
//     }
//   };

//   // Xử lý follow/unfollow
//   const handleFollow = async () => {
//     const userToken = localStorage.getItem("accessToken");
//     const targetUserId = userData.targetUserId;

//     setLoading(true); // Bật trạng thái loading
//     try {
//       const endpoint = isFollowing
//         ? `http://localhost:5000/api/follows/${targetUserId}`
//         : `http://localhost:5000/api/follows/${targetUserId}`;

//       const method = isFollowing ? "DELETE" : "POST";

//       const response = await fetch(endpoint, {
//         method,
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       if (data.success) {
//         if(!isFollowing){ 
//           const senderId = user._id;
//           const senderfullName = user.fullname;
//           const receiverId = targetUserId;
//           const type = ETypeNotify.FOLLOW;
//           const objectId = user._id;
//           console.log("Create notification comment");
//           createNotification(senderId, receiverId, objectId, senderfullName, type);
//         }
//         setIsFollowing(!isFollowing); // Đổi trạng thái follow
//       } else {
//         console.error("Error:", data.message);
//       }
//     } catch (error) {
//       console.error("Error handling follow/unfollow:", error);
//     } finally {
//       setLoading(false); // Tắt trạng thái loading
//     }
//   };

//   const createNotification = async (senderId, receiverId, objectId, senderFullName, type) => {
//     const { accessToken } = authState;
//     try {
//       const response = await fetch(`http://localhost:5000/api/notifies`, {
//         method: "POST",
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           userId: receiverId,
//           objectId,
//           "content": `${senderFullName} đã theo dõi bạn`,
//           type,
//         }),
//       });

//       if (response.ok) {
//         sendNotify({ senderId, receiverId });
//         console.log("Notification created successfully.");
//       } else {
//         console.error("Error creating notification:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error creating notification:", error);
//     }
//   };

//   // Lấy danh sách followers
//   const fetchFollowers = async () => {
//     const userToken = localStorage.getItem("accessToken");
//     const targetUserId = userData.targetUserId;

//     try {
//       const response = await fetch(`http://localhost:5000/api/follows/followers/${targetUserId}`, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       const data = await response.json();
//       if (data.success) {
//         setFollowers(data.followers);
//         setShowFollowers(true); // Hiển thị danh sách followers
//       } else {
//         console.error("Error fetching followers:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching followers:", error);
//     }
//   };

//   // Lấy danh sách followings
//   const fetchFollowings = async () => {
//     const userToken = localStorage.getItem("accessToken");
//     const targetUserId = userData.targetUserId;

//     try {
//       const response = await fetch(`http://localhost:5000/api/follows/following/${targetUserId}`, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       const data = await response.json();
//       if (data.success) {
//         setFollowings(data.following);
//         setShowFollowings(true); // Hiển thị danh sách đang theo dõi
//       } else {
//         console.error("Error fetching followings:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching followings:", error);
//     }
//   };
//   const handleSongClick = (song) => {
//     navigate(`/song/${song._id}`, { state: { song } }); // Điều hướng đến chi tiết bài hát
//   };


//   return (
//     <div className="user-info">
//       <div className="user-card">
//         <div className="user-info__details">
//           <div className="user-info__field">
//             <label>Họ và tên:</label>
//             <span>{userData.fullName}</span>
//           </div>
//           <div className="user-info__field">
//             <label>Email:</label>
//             <span>{userData.email}</span>
//           </div>
//           <div className="user-info__field">
//             <label>Điện thoại:</label>
//             <span>{userData.phone}</span>
//           </div>
//           <div className="user-info__field">
//             <label>Giới tính:</label>
//             <span>{userData.gender}</span>
//           </div>
//           <div className="user-info__field">
//             <label>Ngày sinh:</label>
//             <span>{userData.birthday}</span>
//           </div>
//           <div className="user-info__field">
//             <label>Mô tả:</label>
//             <p>{userData.desc}</p>
//           </div>
//         </div>

//         <div className="user-info__actions">
//           {/* Follow/Unfollow */}
//           <div
//             className="icon-button follow-button"
//             onClick={!loading ? handleFollow : null}
//             style={{ cursor: loading ? "not-allowed" : "pointer" }}
//           >
//             {isFollowing ? (
//               <FaUserMinus size={35} color="red" />
//             ) : (
//               <FaUserPlus size={35} color="green" />
//             )}
//           </div>
//           {/* View Followers */}
//           <div className="icon-button" onClick={fetchFollowers}>
//             <FaUsers size={35} color="#5a5acd" />
//             <span>Người theo dõi</span>
//           </div>

//           {/* View Followings */}
//           <div className="icon-button" onClick={fetchFollowings}>
//             <FaUsers size={35} color="#ff9800" />
//             <span>Đang theo dõi</span>
//           </div>

//           {/* View Songs */}
//           <div className="icon-button" onClick={viewSongs}>
//             <FaMusic size={35} color="#4caf50" />
//             <span>Xem Song</span>
//           </div>

//           <div className="icon-button" onClick={viewAlbums}>
//             <FaMusic size={35} color="#3f51b5" />
//             <span>Album</span>
//           </div>
//         </div>
//       </div>

//       {showSongs && <SongList songs={songs} />}

//             {/* Hiển thị danh sách Album */}
//       {showAlbums && (
//         <div className="albums-list">
//           <h3>Danh sách Album</h3>
//           <button className="sl-logout-btn" onClick={() => setShowAlbums(false)}>
//             Thoát
//           </button>
//           {albums.length > 0 ? (
//             albums.map((album) => (
//               <div className="album-card" key={album._id}>
//                 <img src={album.linkImg} alt={album.title} className="album-img" />
//                 <div className="album-details">
//                   <h4>{album.title}</h4>
//                   <p>{album.desc}</p>
//                   <button onClick={() => viewAlbumDetails(album._id)}>
//                     Chi tiết
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p>Người dùng này chưa có album nào.</p>
//           )}
//         </div>
//       )}


//       {showSongsAlbum && (
//           <div className="song-list">
//             <h2>Bài hát trong album</h2>
//             <button className="sl-logout-btn" onClick={()=> setShowSongsAlbum(false)}>
//               Thoát
//             </button>
//             {songss.length > 0 ? (
//               songss.map((song) => (
//                 <div 
//                   key={song._id} 
//                   className="sl-song-item"
//                   onClick={() => handleSongClick(song)} // Bắt sự kiện click vào bài hát
//                 >
//                   <img
//                     src={imageMap[song._id] || 'default-image.jpg'} // Sử dụng ảnh từ imageMap hoặc ảnh mặc định
//                     alt={song.title}
//                     className="sl-song-img"
//                   />
//                   <div className="sl-song-title">{song.title}</div>
//                   <div className="sl-song-artist">{song.type || 'N/A'}</div>
//                 </div>
//               ))
//             ) : (
//               <p>Không có bài hát nào trong album này.</p>
//             )}
//           </div>
//         )}

//       {/* Hiển thị danh sách followers */}
//       {showFollowers && (
//         <div className="followers-list">
//           <h3>Danh sách người theo dõi</h3>
//           {followers.map((follower, index) => (
//             <div key={index} className="follower-item">
//               <p>{follower.fullname} - {follower.gender}</p>
//             </div>
//           ))}
//           <button onClick={() => setShowFollowers(false)}>Đóng</button>
//         </div>
//       )}

//       {/* Hiển thị danh sách đang theo dõi */}
//       {showFollowings && (
//         <div className="followers-list">
//           <h3>Danh sách đang theo dõi</h3>
//           {followings.map((following, index) => (
//             <div key={index} className="follower-item">
//               <p>{following.username} - {following.fullname}</p>
//             </div>
//           ))}
//           <button onClick={() => setShowFollowings(false)}>Đóng</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserInfo;

import React, { useState, useEffect, useContext} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserPlus, FaUserMinus, FaUsers, FaMusic } from "react-icons/fa";
import "./UserInfo.css";
import { AuthContext } from '../context/AuthContext';
import { sendNotify } from "../services/socketService";
import { getSocket } from '../services/socketService'; 
import SongList from "../components/SongUser/SongList";
const ETypeNotify = require("../enums/ETypeNotify");

const UserInfo = () => {
  const socket = getSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = React.useContext(AuthContext);
  const { user } = authState;

  const [userData, setUserData] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]); // Danh sách followers
  const [followings, setFollowings] = useState([]); // Danh sách đang theo dõi
  const [showFollowers, setShowFollowers] = useState(false); // Trạng thái hiển thị followers
  const [showFollowings, setShowFollowings] = useState(false); // Trạng thái hiển thị followings
  const [loading, setLoading] = useState(false); // Quản lý trạng thái loading

  const [songs, setSongs] = useState([]); // State to store songs
  const [showSongs, setShowSongs] = useState(false); // Toggle songs display

  const [songss, setSongsAlbum] = useState([]); // State to store songs
  const [showSongsAlbum, setShowSongsAlbum] = useState(false); // Toggle songs display

  const [albums, setAlbums] = useState([]);  // State to store albums
  const [showAlbums, setShowAlbums] = useState(false); // Toggle albums display

  const [playlists, setPlaylists] = useState([]); // State to store playlists
  const [showPlaylists, setShowPlaylists] = useState(false); // Toggle playlists display

  const [imageMap, setImageMap] = useState({}); // State lưu các ảnh của bài hát

  const accessToken = localStorage.getItem('accessToken');

  const viewPlaylists = async () => {
    const userToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `http://localhost:5000/api/playlists/creator/${userData.targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      console.log("Fetched playlists:", data);
  
      if (response.ok) {
        setPlaylists(data); // Update playlists state
        setShowPlaylists(true); // Show playlists
      } else {
        console.error("Error fetching playlists:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  // Fetch ảnh cho các bài hát
  const fetchImages = async (songs) => {
    const newImageMap = {};
    for (const song of songss) {
      if (song?.linkImg) {
        try {
          const response = await fetch(song.linkImg, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            newImageMap[song._id] = URL.createObjectURL(blob); // Lưu URL của ảnh
          }
        } catch (error) {
          console.error(`Error fetching image for song ${song.title}:`, error);
        }
      }
    }
    setImageMap(newImageMap); // Cập nhật ảnh vào state
  };
  useEffect(() => {
    if (songss && songss.length > 0) {
      fetchImages(songss); // Gọi fetchImages khi có danh sách bài hát
    }
    if (location.state && location.state.user) {
      const otherUser = location.state.user;
      const formattedBirthday = new Date(otherUser.birthday).toLocaleDateString("en-GB");

      if(user._id === otherUser._id) {
        navigate('/profile');
      }

      setUserData({
        fullName: otherUser.fullname,
        email: otherUser.email,
        phone: otherUser.phone,
        gender: otherUser.gender,
        birthday: formattedBirthday,
        desc: otherUser.desc,
        targetUserId: otherUser._id, // Lấy targetUserId từ dữ liệu user
      });

      // Kiểm tra trạng thái follow ban đầu
      checkFollowStatus(otherUser._id);

      if(socket){
        console.log("Socket instance in UserInfor component:", socket);
  
        if (socket.connected) {
          console.log("Socket is connected.");
        } else {
          console.error("Socket is not connected.");
        }
      }
    }
  }, [location.state, socket, songss]);

  const viewSongs = async () => {
    const userToken = localStorage.getItem("accessToken");
    console.log("targetId: ", userData.targetUserId)
    try {
      const response = await fetch(
        `http://localhost:5000/api/songs/creator/${userData.targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      console.log("Fetched songs:", data);
      setSongs(data); // Set fetched songs
      console.log("Songs state:", songs);
      setShowSongs(true); // Display the songs
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const viewAlbums = async () => {
    const userToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `http://localhost:5000/api/albums/creator/${userData.targetUserId}`,  // Adjust the endpoint accordingly
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      console.log("Fetched albums:", data);
      setAlbums(data); // Set fetched albums
      setShowAlbums(true); // Display the albums
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const viewAlbumDetails = (albumId) => {
    // Fetch songs for the selected album
    const album = albums.find((album) => album._id === albumId);
    setSongsAlbum(album.songs); // Set songs for the selected album
    setShowSongsAlbum(true); // Show the songs of the selected album
  };
  // Kiểm tra trạng thái follow
  const checkFollowStatus = async (targetUserId) => {
    const userToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`http://localhost:5000/api/follows/status/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Xử lý follow/unfollow
  const handleFollow = async () => {
    const userToken = localStorage.getItem("accessToken");
    const targetUserId = userData.targetUserId;

    setLoading(true); // Bật trạng thái loading
    try {
      const endpoint = isFollowing
        ? `http://localhost:5000/api/follows/${targetUserId}`
        : `http://localhost:5000/api/follows/${targetUserId}`;

      const method = isFollowing ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        if(!isFollowing){ 
          const senderId = user._id;
          const senderfullName = user.fullname;
          const receiverId = targetUserId;
          const type = ETypeNotify.FOLLOW;
          const objectId = user._id;
          console.log("Create notification comment");
          createNotification(senderId, receiverId, objectId, senderfullName, type);
        }
        setIsFollowing(!isFollowing); // Đổi trạng thái follow
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error handling follow/unfollow:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  const createNotification = async (senderId, receiverId, objectId, senderFullName, type) => {
    const { accessToken } = authState;
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
          "content": `${senderFullName} đã theo dõi bạn`,
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

  // Lấy danh sách followers
  const fetchFollowers = async () => {
    const userToken = localStorage.getItem("accessToken");
    const targetUserId = userData.targetUserId;

    try {
      const response = await fetch(`http://localhost:5000/api/follows/followers/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFollowers(data.followers);
        setShowFollowers(true); // Hiển thị danh sách followers
      } else {
        console.error("Error fetching followers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Lấy danh sách followings
  const fetchFollowings = async () => {
    const userToken = localStorage.getItem("accessToken");
    const targetUserId = userData.targetUserId;

    try {
      const response = await fetch(`http://localhost:5000/api/follows/following/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFollowings(data.following);
        setShowFollowings(true); // Hiển thị danh sách đang theo dõi
      } else {
        console.error("Error fetching followings:", data.message);
      }
    } catch (error) {
      console.error("Error fetching followings:", error);
    }
  };
  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } }); // Điều hướng đến chi tiết bài hát
  };


  return (
    <div className="user-info">
      <div className="user-card">
        <div className="user-info__details">
          <div className="user-info__field">
            <label>Họ và tên:</label>
            <span>{userData.fullName}</span>
          </div>
          <div className="user-info__field">
            <label>Email:</label>
            <span>{userData.email}</span>
          </div>
          <div className="user-info__field">
            <label>Điện thoại:</label>
            <span>{userData.phone}</span>
          </div>
          <div className="user-info__field">
            <label>Giới tính:</label>
            <span>{userData.gender}</span>
          </div>
          <div className="user-info__field">
            <label>Ngày sinh:</label>
            <span>{userData.birthday}</span>
          </div>
          <div className="user-info__field">
            <label>Mô tả:</label>
            <p>{userData.desc}</p>
          </div>
        </div>

        <div className="user-info__actions">
          {/* Follow/Unfollow */}
          <div
            className="icon-button follow-button"
            onClick={!loading ? handleFollow : null}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {isFollowing ? (
              <FaUserMinus size={35} color="red" />
            ) : (
              <FaUserPlus size={35} color="green" />
            )}
          </div>
          {/* View Followers */}
          <div className="icon-button" onClick={fetchFollowers}>
            <FaUsers size={35} color="#5a5acd" />
            <span>Người theo dõi</span>
          </div>

          {/* View Followings */}
          <div className="icon-button" onClick={fetchFollowings}>
            <FaUsers size={35} color="#ff9800" />
            <span>Đang theo dõi</span>
          </div>

          {/* View Songs */}
          <div className="icon-button" onClick={viewSongs}>
            <FaMusic size={35} color="#4caf50" />
            <span>Xem Song</span>
          </div>

          <div className="icon-button" onClick={viewAlbums}>
            <FaMusic size={35} color="#3f51b5" />
            <span>Album</span>
          </div>

          <div className="icon-button" onClick={viewPlaylists}>
            <FaMusic size={35} color="blue" />
            <span>Playlist</span>
          </div>
        </div>
      </div>

      {showSongs && <SongList songs={songs} />}

            {/* Hiển thị danh sách Album */}
      {showAlbums && (
        <div className="albums-list">
          <h3>Danh sách Album</h3>
          <button className="sl-logout-btn" onClick={() => setShowAlbums(false)}>
            Thoát
          </button>
          {albums.length > 0 ? (
            albums.map((album) => (
              <div className="album-card" key={album._id}>
                <img src={album.linkImg} alt={album.title} className="album-img" />
                <div className="album-details">
                  <h4>{album.title}</h4>
                  <p>{album.desc}</p>
                  <button
                  className="view-btn"
                  onClick={() => navigate(`/album/${album._id}`, { state: { album } })}
                  >
                    Xem Album
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Người dùng này chưa có album nào.</p>
          )}
        </div>
      )}


      {showSongsAlbum && (
          <div className="song-list">
            <h2>Bài hát trong album</h2>
            <button className="sl-logout-btn" onClick={()=> setShowSongsAlbum(false)}>
              Thoát
            </button>
            {songss.length > 0 ? (
              songss.map((song) => (
                <div 
                  key={song._id} 
                  className="sl-song-item"
                  onClick={() => handleSongClick(song)} // Bắt sự kiện click vào bài hát
                >
                  <img
                    src={imageMap[song._id] || 'default-image.jpg'} // Sử dụng ảnh từ imageMap hoặc ảnh mặc định
                    alt={song.title}
                    className="sl-song-img"
                  />
                  <div className="sl-song-title">{song.title}</div>
                  <div className="sl-song-artist">{song.type || 'N/A'}</div>
                </div>
              ))
            ) : (
              <p>Không có bài hát nào trong album này.</p>
            )}
          </div>
        )}

      {showPlaylists && (
        <div className="playlists-section">
          <div className="playlist-header">
            <h3>Playlists</h3>
            <button className="close-btn" onClick={() => setShowPlaylists(false)}>
              Thoát
            </button>
          </div>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist._id} className="playlist-item">
                <h4>{playlist.title}</h4>
                <p>{playlist.description}</p>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/playlist/${playlist._id}`, { state: { playlist } })}
                >
                  Xem Playlist
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Hiển thị danh sách followers */}
      {showFollowers && (
        <div className="followers-list">
          <h3>Danh sách người theo dõi</h3>
          {followers.map((follower, index) => (
            <div key={index} className="follower-item">
              <p>{follower.fullname} - {follower.gender}</p>
            </div>
          ))}
          <button onClick={() => setShowFollowers(false)}>Đóng</button>
        </div>
      )}

      {/* Hiển thị danh sách đang theo dõi */}
      {showFollowings && (
        <div className="followers-list">
          <h3>Danh sách đang theo dõi</h3>
          {followings.map((following, index) => (
            <div key={index} className="follower-item">
              <p>{following.username} - {following.fullname}</p>
            </div>
          ))}
          <button onClick={() => setShowFollowings(false)}>Đóng</button>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
