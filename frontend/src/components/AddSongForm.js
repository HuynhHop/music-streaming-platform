import React from 'react';
import './AddSongForm.css';

const AddSongForm = ({ newSong, setNewSong, handleAddSong, setIsAddingSong }) => {
  return (
    <div className="add-form">
      <label>
        Tên bài hát
      </label>
      <input 
        type="text" 
        placeholder="Song Title" 
        value={newSong.title} 
        onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
      />
      <label>
        Nghệ sĩ
      </label>
      <input 
        type="text" 
        placeholder="Artist" 
        value={newSong.artist} 
        onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
      />
      <label>
        Thể loại
      </label>
      <input 
        type="text" 
        placeholder="Type" 
        value={newSong.type} 
        onChange={(e) => setNewSong({ ...newSong, type: e.target.value })}
      />
      <label>
        Mô tả
      </label>
      <textarea 
        placeholder="Description" 
        value={newSong.description} 
        onChange={(e) => setNewSong({ ...newSong, description: e.target.value })}
      />
      
      {/* Thêm trường nhập lời bài hát */}
      <label>
        Lời bài hát
      </label>
      <textarea
        placeholder="Lyrics"
        value={newSong.lyrics}
        onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
      />
      <label>
        Chọn tệp âm thanh
      </label>
      {/* Thêm trường upload file MP3 */}
      <input 
        type="file" 
        accept="audio/*" 
        onChange={(e) => setNewSong({ ...newSong, fileMP3: e.target.files[0] })}
      />
      <label>
        Chọn tệp hình ảnh
      </label>
      {/* Thêm trường upload file hình ảnh */}
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setNewSong({ ...newSong, filePhoto: e.target.files[0] })}
      />
      
      <button onClick={handleAddSong}>Add</button>
      <button onClick={() => setIsAddingSong(false)}>Cancel</button>
    </div>
  );
};

export default AddSongForm;
