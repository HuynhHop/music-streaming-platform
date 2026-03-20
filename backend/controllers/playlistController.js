const Playlist = require("../models/Playlist");
const Song = require("../models/Song"); // Import model Song

const createPlaylist = async (req, res) => {
    try {
        const { title, songs, creator } = req.body;
        const newPlaylist = new Playlist({
            title,
            songs,
            creator,
            isDeleted: false,
            createAt: Date.now(),
        });

        const savedPlaylist = await newPlaylist.save();
        res.status(201).json(savedPlaylist);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const getPlaylists = async (req, res) => {
    try {
      const playlists = await Playlist.find({ isDeleted: false }).populate('songs').populate('creator');
      res.status(200).json(playlists);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving playlists' });
    }
};

const getAlbumById = async (req, res) => {
  try {
    const { _id } = req.params; 

    const playList = await Playlist.findOne({ _id: _id, isDeleted: false }).populate('songs creator');

    if (!playList) {
      return res.status(404).json({ error: 'Playlist not found or already deleted' });
    }

    res.status(200).json(playList);
  } catch (error) {
    console.error('Error retrieving playlist by ID:', error.message);
    res.status(500).json({ error: 'Error retrieving playlist', details: error.message });
  }
};

const updatePlaylist = async (req, res) => {
  try {
      const { title } = req.body; // Chỉ cập nhật title

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
          req.params._id,
          { title },
          { new: true }
      );

      if (!updatedPlaylist) {
          return res.status(404).json({ error: 'Playlist not found' });
      }

      res.status(200).json(updatedPlaylist);
  } catch (error) {
      res.status(500).json({ error: 'Error updating playlist' });
  }
};

const deletePlaylist = async (req, res) => {
  try {
      const deletedPlaylist = await Playlist.findByIdAndUpdate(
          req.params._id,
          { isDeleted: true },
          { new: true }
      );

      if (!deletedPlaylist) {
          return res.status(404).json({ error: 'Playlist not found' });
      }

      res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Error deleting playlist' });
  }
};

// New Controller Function: Get Playlists by Creator
const getPlaylistByCreator = async (req, res) => {
    try {
        const creatorId = req.params.creatorId;

        const playlists = await Playlist.find({ 
            creator: creatorId, 
            isDeleted: false 
        }).populate('songs');

        if (playlists.length === 0) {
            return res.status(404).json({ message: 'No playlists found for this creator.' });
        }

        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving playlists by creator.' });
    }
};

const addPlaylistByCreator = async (req, res) => {
    try {
      const { creatorId } = req.params; // Lấy creatorId từ params
      const { title } = req.body; // Lấy title từ request body
  
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
  
      // Tạo playlist mới
      const newPlaylist = new Playlist({
        title,
        creator: creatorId, // Gán creatorId cho playlist
        isDeleted: false,
        createdAt: Date.now(),
      });
  
      // Lưu playlist vào database
      const savedPlaylist = await newPlaylist.save();
  
      // Trả về kết quả
      res.status(201).json(savedPlaylist);
    } catch (error) {
      console.error('Error adding playlist by creator:', error.message);
      res.status(500).json({ error: 'Error adding playlist by creator' });
    }
  };
  const addSongToPlaylist = async (req, res) => {
    try {
      const { playlistId } = req.params; 
      const { songTitle } = req.body; 
  
      const song = await Song.findOne({ title: songTitle, isDeleted: false });
      if (!song) {
        return res.status(404).json({ error: `Song with title "${songTitle}" not found` });
      }
  
      const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false });
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found or already deleted" });
      }
  
      if (playlist.songs.includes(song._id)) {
        return res.status(400).json({ error: "Song already exists in the playlist" });
      }
  
      playlist.songs.push(song._id);
      await playlist.save();
  
      const updatedPlaylist = await Playlist.findById(playlistId).populate("songs");
  
      res.status(200).json({
        message: "Song added successfully to the playlist",
        playlist: updatedPlaylist,
      });
    } catch (error) {
      console.error("Error adding song to playlist:", error.message);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        // Tìm playlist và populate danh sách bài hát
        const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false }).populate('songs');
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or already deleted' });
        }

        // Tìm vị trí bài hát trong playlist.songs dựa trên _id
        const songIndex = playlist.songs.findIndex((song) => song._id.toString() === songId);
        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not found in playlist' });
        }

        // Xóa bài hát khỏi mảng
        playlist.songs.splice(songIndex, 1);
        await playlist.save();

        // Lấy danh sách playlist đã cập nhật
        const updatedPlaylist = await Playlist.findById(playlistId).populate('songs');
        res.status(200).json({
            message: 'Song removed successfully from playlist',
            playlist: updatedPlaylist,
        });
    } catch (error) {
        console.error('Error removing song from playlist:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const getPlaylistByName= async (req, res) =>{ 
  try {
    const regex = new RegExp(req.params.title, "i"); // Case-insensitive regex for partial matches
    const playlists = await Playlist.find({ title: regex, isDeleted: false }).populate('songs');
    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'No playlists found with this title.' });
    }
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error retrieving playlists by name.' });
  }
};

module.exports = { getPlaylistByName, removeSongFromPlaylist, createPlaylist, getPlaylists, getAlbumById, updatePlaylist, deletePlaylist, getPlaylistByCreator, addPlaylistByCreator, addSongToPlaylist };