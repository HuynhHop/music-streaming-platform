import React, { Suspense, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import './UserDashboard.css'; // Ensure the CSS is linked
import { AuthContext } from '../context/AuthContext';
import {io} from 'socket.io-client';
import { connectSocket, disconnectSocket } from "../services/socketService";

const SongList = React.lazy(() => import('../components/SongList'));
const ImageSlider = React.lazy(() => import('../components/ImageSlider'));
const MusicFilter = React.lazy(() => import('../components/MusicFilter'));
const RankingTable = React.lazy(() => import('../components/RankingTable'));

const UserDashboard = () => {
  const { authState } = useContext(AuthContext);
  const { accessToken, user, role} = authState; 
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]); 
  const [topTotalPlays, setTopTotalPlays] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    connectSocket(user._id, setSocket); 
  }, [socket]);  

  useEffect(() => {
    if (!accessToken) {
      console.log("Không tìm thấy token");
      navigate('/login'); 
    } else {
      console.log("Token: ", accessToken);
      console.log("Data: ", user);
      console.log("Role: ", role);
    }

    if (socket && user) {
      socket.emit("newUser", user._id); 
      console.log(`Sent newUser event for user: ${user._id}`);
    }

    // Fetch songs from API
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/songs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
    
        const data = await response.json();
    
        // Sắp xếp các bài hát theo trường createdAt (giảm dần)
        const sortedSongs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const sortedSongsByTotalPlay = data.sort((a, b) => a.totalPlays -b.totalPlays);
    
        // Lấy 4 bài hát mới nhất
        const latestSongs = sortedSongs.slice(0, 4);
    
        // Cập nhật trạng thái với 4 bài hát mới nhất
        setSongs(latestSongs);
        setTopTotalPlays(sortedSongsByTotalPlay.slice(0, 10));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setLoading(false);
      }
    };
    

    fetchSongs(); 
  }, [navigate, socket]);

  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } });
  };

  const { ref: imageSliderRef, inView: imageSliderInView } = useInView({ triggerOnce: true });
  const { ref: musicFilterRef, inView: musicFilterInView } = useInView({ triggerOnce: true });
  const { ref: songListRef, inView: songListInView } = useInView({ triggerOnce: true });
  const { ref: rankingTableRef, inView: rankingTableInView } = useInView({ triggerOnce: true });

  return (
    <div className="page">
      <div className="streak-floating">
        🔥 {authState.user?.streak?.current || 0} | 🏆 {authState.user?.rank || "Dong"}
      </div>
      <Suspense fallback={<div>Đang tải...</div>}>
        <div ref={imageSliderRef} className={`fade-in ${imageSliderInView ? 'visible' : ''}`}>
          {imageSliderInView && <ImageSlider />}
        </div>
      </Suspense>

      <Suspense fallback={<div>Đang tải...</div>}>
        <div ref={musicFilterRef} className={`fade-in ${musicFilterInView ? 'visible' : ''}`}>
          {musicFilterInView && <MusicFilter />}
        </div>
      </Suspense>

      <Suspense fallback={<div>Đang tải...</div>}>
        <div ref={songListRef} className={`fade-in ${songListInView ? 'visible' : ''}`}>
          {songListInView && (
            <SongList songs={songs} onSongClick={handleSongClick} loading={loading} />
          )}
        </div>
      </Suspense>

      <Suspense fallback={<div>Đang tải...</div>}>
        <div ref={rankingTableRef} className={`fade-in ${rankingTableInView ? 'visible' : ''}`}>
          {rankingTableInView && <RankingTable topTotalPlays={topTotalPlays} />}
        </div>
      </Suspense>
    </div>
  );
};

export default UserDashboard;
