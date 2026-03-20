import './SongItem.css'; // Import file CSS cho SongItem
import React, { useState, useEffect, useContext } from 'react';

const SongItem = ({ song, onSongClick }) => {
  const [imageSrc, setImageSrc] = useState("");

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

    if (song) {
      fetchImage();
    } else {
      //setLoading(false);
    }
  }, [song]);
  return (
    <div className="song-item" onClick={() => onSongClick(song)}>
      <div className="song-content">
        <img
          src={imageSrc || song.linkImg || "/default-song-image.jpg"} // Sử dụng ảnh đã tải hoặc fallback
          alt={song.title}
          className="song-image"
        />
        <div className="song-details">
          <h4 className="song-title">{song.title}</h4>
          <p className="artist-name">
            {song.artist && song.artist.fullName ? song.artist.fullName : 'Unknown Artist'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SongItem;
