import React from 'react';
import SongItem from './SongItem'; // Import SongItem
import './SongList.css'; // Import file CSS

const SongList = ({ songs, onSongClick, loading }) => {
  if (loading) {
    return <div>Đang tải bài hát...</div>;
  }

  return (
    <div className="song-list-container">
      <h2>Bài hát mới</h2>
      <div className="song-list">
        {songs.length === 0 ? (
          <div>Không có bài hát nào!</div>
        ) : (
          songs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              onSongClick={onSongClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SongList;
