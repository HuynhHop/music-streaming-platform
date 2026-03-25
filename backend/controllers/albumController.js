const mongoose = require("mongoose");
const Album = require("../models/Album");
const Song = require("../models/Song");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Create album
const createAlbum = catchAsync(async (req, res) => {
  const { creator, title, songs, desc, linkImg } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !desc || !linkImg || !songs || !songs.length) {
    throw new AppError("Title, Description, Image Link, and Songs are required", 400);
  }

  // Tìm các bài hát theo title
  const songIds = [];
  for (const songTitle of songs) {
    const song = await Song.findOne({ title: songTitle, isDeleted: false });

    if (!song) {
      throw new AppError(`Song with title "${songTitle}" not found`, 404);
    }

    songIds.push(song._id);
  }

  // Tạo album mới
  const newAlbum = new Album({
    creator,
    title,
    songs: songIds,
    desc,
    linkImg,
    isDeleted: false,
    createAt: new Date(),
  });

  const savedAlbum = await newAlbum.save();
  res.status(201).json(savedAlbum);
});

// Get all albums
const getAlbums = catchAsync(async (req, res) => {
  const albums = await Album.find({ isDeleted: false }).populate({
    path: "songs",
    select: "title artist",
  });

  if (albums.length === 0) {
    throw new AppError("No albums found", 404);
  }

  res.status(200).json(albums);
});

// Update an album
const updateAlbum = catchAsync(async (req, res) => {
  const { title, desc } = req.body;

  if (!title || !desc) {
    throw new AppError("Title and Description are required", 400);
  }

  const updatedAlbum = await Album.findOneAndUpdate(
    { _id: req.params._id, isDeleted: false },
    { title, desc },
    { new: true, runValidators: true }
  );

  if (!updatedAlbum) {
    throw new AppError("Album not found or already deleted", 404);
  }

  res.status(200).json(updatedAlbum);
});

// Soft delete an album
const deleteAlbum = catchAsync(async (req, res) => {
  const deletedAlbum = await Album.findOneAndUpdate(
    { _id: req.params._id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!deletedAlbum) {
    throw new AppError("Album not found or already deleted", 404);
  }

  res.status(200).json({ message: "Album deleted successfully" });
});

// Add a song to an existing album by title
const addSongToAlbum = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { songTitle } = req.body;

  if (!songTitle) {
    throw new AppError("Song title is required", 400);
  }

  const song = await Song.findOne({ title: songTitle, isDeleted: false });
  if (!song) {
    throw new AppError(`Song with title "${songTitle}" not found`, 404);
  }

  const album = await Album.findOne({ _id: id, isDeleted: false });
  if (!album) {
    throw new AppError("Album not found or already deleted", 404);
  }

  if (album.songs.includes(song._id)) {
    throw new AppError("Song already exists in the album", 400);
  }

  album.songs.push(song._id);
  await album.save();

  const updatedAlbum = await Album.findById(id).populate("songs");

  res.status(200).json({
    message: "Song added successfully to the album",
    album: updatedAlbum,
  });
});

// Get albums by creator
const getAlbumsByCreator = catchAsync(async (req, res) => {
  const { creatorId } = req.params;

  const albums = await Album.find({ creator: creatorId, isDeleted: false }).populate('songs');

  if (!albums.length) {
    throw new AppError("No albums found for this creator", 404);
  }

  res.status(200).json(albums);
});

// Add album by creator
const addAlbumByCreator = catchAsync(async (req, res) => {
  const { title, desc, linkImg, songs } = req.body;
  const creatorId = req.user._id;

  if (!title || !desc || !linkImg) {
    throw new AppError("Title, Description, and Image Link are required", 400);
  }

  const newAlbum = new Album({
    title,
    desc,
    linkImg,
    songs: songs || [],
    creator: creatorId,
    isDeleted: false,
  });

  const savedAlbum = await newAlbum.save();
  res.status(201).json(savedAlbum);
});

// Get album by ID
const getAlbumById = catchAsync(async (req, res) => {
  const { _id } = req.params;

  const album = await Album.findOne({ _id: _id, isDeleted: false }).populate('songs creator');

  if (!album) {
    throw new AppError("Album not found or already deleted", 404);
  }

  res.status(200).json(album);
});

// Delete song from album
const deleteSongFromAlbum = catchAsync(async (req, res) => {
  const { albumId, songId } = req.params;

  const album = await Album.findOne({ _id: albumId, isDeleted: false }).populate('songs');
  if (!album) {
    throw new AppError("Album not found or already deleted", 404);
  }

  const songIndex = album.songs.findIndex((song) => song._id.toString() === songId);
  if (songIndex === -1) {
    throw new AppError("Song not found in album", 404);
  }

  album.songs.splice(songIndex, 1);
  await album.save();

  const updatedAlbum = await Album.findById(albumId).populate('songs');

  res.status(200).json({
    message: "Song removed successfully from album",
    album: updatedAlbum,
  });
});

// Get album by name
const getAlbumByName = catchAsync(async (req, res) => {
  const regex = new RegExp(req.params.title, "i");
  const albums = await Album.find({ title: regex, isDeleted: false }).populate("songs");

  if (albums.length === 0) {
    throw new AppError("No albums found with this title", 404);
  }

  res.status(200).json({ success: true, albums });
});

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