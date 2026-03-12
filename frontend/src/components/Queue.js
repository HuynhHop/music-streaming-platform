import React, { useState } from 'react';
import './Queue.css';

const Queue = ({ songs, onSelectSong, onClose, onRemoveSong }) => {
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSelectSong = (song) => {
    setSelectedSong(song.id);  // Lưu ID bài hát được chọn để áp dụng hiệu ứng
    onSelectSong(song); // Gọi hàm onSelectSong nếu cần
  };

  const handleRemove = (songId) => {
    onRemoveSong(songId); // Gọi hàm onRemoveSong để xóa bài hát
  };

  return (
    <div className="queue-modal">
      <div className="queue-modal-content">
        <h2>Danh sách đang phát</h2>
        <button onClick={onClose} className="close-button">Đóng</button>
        <ul>
          {songs.map((song) => (
            <li
              key={song.id}
              className={`queue-item ${selectedSong === song.id ? 'selected' : ''}`}  // Áp dụng class selected khi bài hát được chọn
              onClick={() => handleSelectSong(song)}
            >
              <span>{song.title}</span>
              <button onClick={(e) => { e.stopPropagation(); handleRemove(song.id); }} className="remove-button">
                <span className="remove-icon">×</span> {/* Biểu tượng X */}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Queue;
