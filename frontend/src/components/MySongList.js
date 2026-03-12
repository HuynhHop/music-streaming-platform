// src/components/MySongList.js

import React, { useState, useEffect } from 'react';
import MySongItem from './MySongItem'; // Import MySongItem component

const MySongList = () => {
  // Dữ liệu giả lập bài hát, bạn có thể thay thế bằng API call
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Mô phỏng việc lấy dữ liệu từ API
    const fetchSongs = () => {
      const fetchedSongs = [
        {
          id: 1,
          title: 'Bài hát số 1',
          type: 'Pop', // Đây có thể là một enum EType
          artist: { name: 'Ca sĩ A' },  // Giả sử Artist là đối tượng có thuộc tính name
          decs: 'Mô tả bài hát số 1',
          lyrics: 'Lời bài hát số 1',
          creator: { name: 'Người tạo 1' },  // Creator là đối tượng User với thuộc tính name
          linkImg: 'https://via.placeholder.com/150',
          linkSong: 'https://link.to/song1.mp3',
          createAt: '2024-10-01',
          updateAt: '2024-10-02',
          isDeleted: false,
          isBlocked: false,
          totalPlays: 150,
        },
        {
          id: 2,
          title: 'Bài hát số 2',
          type: 'Rock',
          artist: { name: 'Ca sĩ B' },
          decs: 'Mô tả bài hát số 2',
          lyrics: 'Lời bài hát số 2',
          creator: { name: 'Người tạo 2' },
          linkImg: 'https://via.placeholder.com/150',
          linkSong: 'https://link.to/song2.mp3',
          createAt: '2024-11-01',
          updateAt: '2024-11-02',
          isDeleted: false,
          isBlocked: true,
          totalPlays: 200,
        },
        // Thêm nhiều bài hát nữa ở đây
      ];
      setSongs(fetchedSongs);
    };

    fetchSongs();
  }, []);

  return (
    <div className="my-song-list">
      <h2>My Songs</h2> {/* Tiêu đề đã thay đổi thành "My Songs" */}
      <div className="my-song-list__container">
        {songs.length > 0 ? (
          songs.map((song) => <MySongItem key={song.id} song={song} />)
        ) : (
          <p>Không có bài hát nào được đăng tải.</p>
        )}
      </div>
    </div>
  );
};

export default MySongList;
