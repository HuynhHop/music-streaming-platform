import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './EditSongForm.css';

const EditSongForm = ({ songData, onInputChange, onSubmit, onCancel }) => {
  const [localSongData, setLocalSongData] = useState(songData);

  // Handle any changes to the song data from props
  useEffect(() => {
    setLocalSongData(songData);
  }, [songData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSongData({ ...localSongData, [name]: value });
    onInputChange(e);  // Pass the change to the parent component if needed
  };

  return (
    <div className="edit-song-form-container">
      <h2>Chỉnh sửa Bài hát</h2>
      <form onSubmit={onSubmit}>
        <label>
          Tên Bài hát:
          <input
            type="text"
            name="title"
            value={localSongData.title}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Loại Bài hát:
          <input
            type="text"
            name="type"
            value={localSongData.type}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Nghệ sĩ:
          <input
            type="text"
            name="artist"
            value={localSongData.artist?.fullName || ''}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Mô tả:
          <textarea
            name="descs"
            value={localSongData.descs || ''}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Lời bài hát:
          <textarea
            name="lyrics"
            value={localSongData.lyrics || ''}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Link ảnh:
          <input
            type="text"
            name="linkImg"
            value={localSongData.linkImg || ''}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Link bài hát:
          <input
            type="text"
            name="linkSong"
            value={localSongData.linkSong || ''}
            onChange={handleInputChange}
          />
        </label>
        
        <div className="edit-song-form-container__buttons">
          <button type="submit">Lưu</button>
          <button type="button" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

EditSongForm.propTypes = {
  songData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    artist: PropTypes.shape({
      fullName: PropTypes.string.isRequired,
    }).isRequired,
    descs: PropTypes.string,
    lyrics: PropTypes.string,
    creator: PropTypes.string.isRequired,
    linkImg: PropTypes.string,
    linkSong: PropTypes.string,
    createAt: PropTypes.string.isRequired,
    updateAt: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    isBlocked: PropTypes.bool.isRequired,
    totalPlays: PropTypes.number.isRequired,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditSongForm;
