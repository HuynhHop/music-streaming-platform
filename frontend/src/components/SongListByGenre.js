import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SongItemV2 from '../components/SongItemV2'; // Reuse SongItem component
import './SongList.css'; // Reuse the existing CSS

const SongListByGenre = () => {
  const { genre } = useParams(); // Get genre from URL params
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongsByGenre = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5000/api/songs/type/${genre}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch songs by genre');
        }
        const data = await response.json();
        setSongs(data); // Cập nhật danh sách bài hát
      } catch (error) {
        console.error('Error fetching songs by genre:', error);
      } finally {
        setLoading(false); // Kết thúc trạng thái loading
      }
    };

    fetchSongsByGenre();
  }, [genre]);


  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } });
  };

  if (loading) {
    return <div style={{minHeight:"100vh"}}>Đang tải bài hát...</div>;
  }

  return (
    <div className="song-list-container" style={{minHeight:"100vh"}}>
      <h2>Danh sách bài hát - {genre}</h2>
      <div className="song-list" style={{display:"flex", flexDirection:"column", margin:"10px"}}>
        {songs.length === 0 ? (
          <div>Không có bài hát nào thuộc thể loại này!</div>
        ) : (
          songs.map((song) => (
            <SongItemV2
              key={song.id}
              song={song}
              onSongClick={handleSongClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SongListByGenre;


