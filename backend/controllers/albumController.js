const mongoose = require("mongoose");
const Album = require("../models/Album");
const Song = require("../models/Song"); // Import model Song để tìm bài hát theo title

const createAlbum = async (req, res) => {
  try {
    const { creator, title, songs, desc, linkImg } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !desc || !linkImg || !songs || !songs.length) {
      return res.status(400).json({
        error: "Title, Description, Image Link, and Songs are required",
      });
    }

    // Tìm các bài hát theo title
    const songIds = [];
    for (const songTitle of songs) {
      const song = await Song.findOne({ title: songTitle, isDeleted: false });

      if (!song) {
        return res.status(404).json({ error: `Song with title "${songTitle}" not found` });
      }

      songIds.push(song._id); // Lấy _id của bài hát tìm được
    }

    // Tạo album mới
    const newAlbum = new Album({
      creator,
      title,
      songs: songIds, // Gán danh sách _id của bài hát
      desc,
      linkImg,
      isDeleted: false,
      createAt: new Date(),
    });

    // Lưu album vào database
    const savedAlbum = await newAlbum.save();

    res.status(201).json(savedAlbum); // Phản hồi album vừa tạo
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating album", details: error.message });
  }
};

// Get all albums (updated)
const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ isDeleted: false }).populate({
      path: "songs",
      select: "title artist", // Select only the fields you want to include
    });
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error retrieving albums:", error.message);
    res.status(500).json({ error: "Error retrieving albums", details: error.message });
  }
};

// Update an album (only title and desc can be updated)
const updateAlbum = async (req, res) => {
  try {
    const { title, desc } = req.body;

    // Validate required fields
    if (!title || !desc) {
      return res.status(400).json({ error: "Title and Description are required" });
    }

    const updatedAlbum = await Album.findOneAndUpdate(
      { _id: req.params._id, isDeleted: false },
      { title, desc },
      { new: true }
    );

    if (!updatedAlbum) {
      return res.status(404).json({ error: "Album not found or already deleted" });
    }

    res.status(200).json(updatedAlbum);
  } catch (error) {
    console.error("Error updating album:", error.message);
    res.status(500).json({ error: "Error updating album", details: error.message });
  }
};

// Soft delete an album
const deleteAlbum = async (req, res) => {
  try {
    const deletedAlbum = await Album.findOneAndUpdate(
      { _id: req.params._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedAlbum) {
      return res.status(404).json({ error: "Album not found or already deleted" });
    }

    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error("Error deleting album:", error.message);
    res.status(500).json({ error: "Error deleting album", details: error.message });
  }
};

// Add a song to an existing album by title
const addSongToAlbum = async (req, res) => {
  try {
    const { id } = req.params; // Album ID from route
    const { songTitle } = req.body; // Song title from request body

    // Find the song by title and ensure it's not deleted
    const song = await Song.findOne({ title: songTitle, isDeleted: false });
    if (!song) {
      return res.status(404).json({ error: `Song with title "${songTitle}" not found` });
    }

    // Find the album by ID and ensure it's not deleted
    const album = await Album.findOne({ _id: id, isDeleted: false });
    if (!album) {
      return res.status(404).json({ error: "Album not found or already deleted" });
    }

    // Check if the song is already in the album
    if (album.songs.includes(song._id)) {
      return res.status(400).json({ error: "Song already exists in the album" });
    }

    // Add the song ID to the album's songs array
    album.songs.push(song._id);
    await album.save();

    // Populate songs for response
    const updatedAlbum = await Album.findById(id).populate("songs");

    res.status(200).json({
      message: "Song added successfully to the album",
      album: updatedAlbum,
    });
  } catch (error) {
    console.error("Error adding song to album:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


// Get albums by creator
const getAlbumsByCreator = async (req, res) => {
  const { creatorId } = req.params;
  try {
    const albums = await Album.find({ creator: creatorId, isDeleted: false }).populate('songs');

    if (!albums.length) {
      return res.status(404).json({ message: 'No albums found for this creator' });
    }

    res.status(200).json(albums);
  } catch (error) {
    console.error("Error fetching albums by creator:", error.message);
    res.status(500).json({ error: 'Error fetching albums by creator', details: error.message });
  }
};

// Add album by creator
const addAlbumByCreator = async (req, res) => {
  try {
    const { title, desc, linkImg, songs } = req.body;
    const creatorId = req.user._id; // From middleware

    if (!title || !desc || !linkImg) {
      return res.status(400).json({ error: 'Title, Description, and Image Link are required' });
    }

    const newAlbum = new Album({
      title,
      desc,
      linkImg,
      songs,
      creator: creatorId,
      isDeleted: false,
    });

    const savedAlbum = await newAlbum.save();
    res.status(201).json(savedAlbum);
  } catch (error) {
    console.error("Error adding album by creator:", error.message);
    res.status(500).json({ error: 'Error creating album', details: error.message });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { _id } = req.params; 

    const album = await Album.findOne({ _id: _id, isDeleted: false }).populate('songs creator');

    if (!album) {
      return res.status(404).json({ error: 'Album not found or already deleted' });
    }

    res.status(200).json(album);
  } catch (error) {
    console.error('Error retrieving album by ID:', error.message);
    res.status(500).json({ error: 'Error retrieving album', details: error.message });
  }
};

const deleteSongFromAlbum = async (req, res) => {
  try {
      const { albumId, songId } = req.params; // Lấy albumId và songId từ route params

      // Tìm album và populate danh sách bài hát
      const album = await Album.findOne({ _id: albumId, isDeleted: false }).populate('songs');
      if (!album) {
          return res.status(404).json({ error: 'Album not found or already deleted' });
      }

      // Tìm vị trí bài hát trong album.songs dựa trên _id
      const songIndex = album.songs.findIndex((song) => song._id.toString() === songId);
      if (songIndex === -1) {
          return res.status(404).json({ error: 'Song not found in album' });
      }

      // Xóa bài hát khỏi mảng
      album.songs.splice(songIndex, 1);
      await album.save();

      // Lấy danh sách album đã cập nhật
      const updatedAlbum = await Album.findById(albumId).populate('songs');
      res.status(200).json({
          message: 'Song removed successfully from album',
          album: updatedAlbum,
      });
  } catch (error) {
      console.error('Error deleting song from album:', error.message);
      res.status(500).json({
          error: 'Internal server error',
          details: error.message,
      });
  }
};

const getAlbumByName = async (req, res) => {
  try {
    const regex = new RegExp(req.params.title, "i"); // Tạo regex để tìm kiếm không phân biệt chữ hoa/thường
    const albums = await Album.find({ title: regex }).populate("songs"); // populate nếu cần chi tiết bài hát
    if (albums.length === 0) {
      return res.status(404).json({ success: false, message: "No albums found with this title." });
    }
    res.status(200).json({ success: true, albums });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error retrieving albums by name." });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  updateAlbum,
  deleteAlbum,
  getAlbumsByCreator,
  addAlbumByCreator,
  addSongToAlbum,
  getAlbumById,
  deleteSongFromAlbum,
  getAlbumByName,
};
