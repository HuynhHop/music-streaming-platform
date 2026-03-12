import React, { useState, useEffect, useContext } from 'react';
import './SongItemV2.css'; // Import file CSS cho SongItem

// Dữ liệu mẫu nghệ sĩ
const allArtists = [
  { id: 1, fullName: 'Ca sĩ 1', desc: 'Mô tả về ca sĩ 1', isValidation: true },
  { id: 2, fullName: 'Ca sĩ 2', desc: 'Mô tả về ca sĩ 2', isValidation: false },
  { id: 3, fullName: 'Ca sĩ 3', desc: 'Mô tả về ca sĩ 3', isValidation: true },
  { id: 4, fullName: 'Ca sĩ 4', desc: 'Mô tả về ca sĩ 4', isValidation: true },
  // Thêm các nghệ sĩ khác
];

const SongItemV2 = ({ song, onSongClick, onDelete, enableDelete}) => {
  // Tìm nghệ sĩ theo id
  const artist = allArtists.find(artist => artist.id === song.artist);
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
    <div className="song-item-v2" onClick={() => onSongClick(song)}>
      <div className="song-content-v2">
        <img
          src={imageSrc}
          alt={song.title}
          className="song-image-v2"
        />
        <div className="song-details-v2">
          <h4 className="song-title-v2">{song.title}</h4>
          <p className="artist-name-v2">
            {artist ? artist.fullName : 'N/A'}
          </p>
        </div>
        { enableDelete? (
        <button className="delete-button" onClick={(e) => { 
                e.stopPropagation(); 
                onDelete();  
            }}>
          Xóa
          </button>
        ) : null }
      </div>
    </div>
  );
};

export default SongItemV2;
