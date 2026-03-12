import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Đảm bảo import useNavigate từ react-router-dom
import './SongList.css';

const SongList = ({ songs }) => {
  const [imageMap, setImageMap] = useState({});
  const [isVisible, setIsVisible] = useState(true); // Thêm state để quản lý việc hiển thị container
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const accessToken = localStorage.getItem('accessToken');

  // Fetch ảnh cho các bài hát
  const fetchImages = async (songs) => {
    const newImageMap = {};
    for (const song of songs) {
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
    if (songs && songs.length > 0) {
      fetchImages(songs); // Gọi fetchImages khi có danh sách bài hát
    }
  }, [songs]);

  if (!isVisible) {
    return null; // Nếu container không visible thì trả về null (không render gì)
  }

  const handleSongClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } }); // Điều hướng đến chi tiết bài hát
  };

  return (
    <div className="sl-song-list-container">
      <button className="sl-logout-btn" onClick={() => setIsVisible(false)}>
        Thoát
      </button>
      <h2>Danh sách bài hát</h2>
      <div className="sl-song-list">
        {songs.map((song) => (
          <div 
            key={song._id} 
            className="sl-song-item"
            onClick={() => handleSongClick(song)} // Bắt sự kiện click vào bài hát
          >
            <img
              src={imageMap[song._id] || 'default-image.jpg'}
              alt={song.title}
              className="sl-song-img"
            />
            <div className="sl-song-title">{song.title}</div>
            <div className="sl-song-artist">{song.artist?.fullName || 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;