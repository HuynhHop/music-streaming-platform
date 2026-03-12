import React, { useState } from 'react';
import './PlaylistForm.css';

const PlaylistForm = ({ playlists, song, onAddToPlaylist, onCreateNewPlaylist, onClose }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State để quản lý thông báo thành công

  const handleCreateNewPlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreateNewPlaylist(newPlaylistName, song);
      setNewPlaylistName(''); // Reset tên playlist
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
      if (!accessToken) {
        console.error('Không tìm thấy access token');
        return;
      }

      // Xây dựng body với titleSong
      const bodyData = {
        songTitle: song.title, // Truyền title của bài hát vào body
      };

      console.log(`URL API: http://localhost:5000/api/playlists/${playlistId}/song`);
      console.log('Body:', bodyData);

      // Thực hiện API call để thêm bài hát vào playlist
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/song`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Thêm token vào header
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData), // Truyền body vào trong request
      });

      if (!response.ok) {
        throw new Error('Không thể thêm bài hát vào playlist');
      }

      const data = await response.json();
      console.log('Bài hát đã được thêm vào playlist:', data);
      onAddToPlaylist(playlistId); // Cập nhật UI sau khi thêm bài hát thành công

      // Hiển thị thông báo thành công
      setSuccessMessage('Bài hát đã được thêm vào playlist thành công!');

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi thêm bài hát vào playlist:', error);
    }
  };

  return (
    <div className="playlist-modal">
      <div className="playlist-modal-content">
        <h2>Thêm vào Playlist</h2>
        <button onClick={onClose}>Đóng</button>
        <input
          type="text"
          placeholder="Tên Playlist mới"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
        />
        <button onClick={handleCreateNewPlaylist}>Tạo Playlist Mới</button>
        {successMessage && <div className="success-message">{successMessage}</div>} {/* Hiển thị thông báo thành công */}
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist._id}>
              <button onClick={() => handleAddToPlaylist(playlist._id)}>
                {playlist.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistForm;
