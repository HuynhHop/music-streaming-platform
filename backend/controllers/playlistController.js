const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Create playlist
const createPlaylist = catchAsync(async (req, res) => {
  const { title, songs, creator } = req.body;

  if (!title || !creator) {
    throw new AppError("Missing required fields: title and creator", 400);
  }

  const newPlaylist = new Playlist({
    title,
    songs: songs || [],
    creator,
    isDeleted: false,
    createAt: Date.now(),
  });

  const savedPlaylist = await newPlaylist.save();
  const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
    .populate('songs')
    .populate('creator', 'fullname email username');

  res.status(201).json(populatedPlaylist);
});

// Get all playlists
const getPlaylists = catchAsync(async (req, res) => {
  const playlists = await Playlist.find({ isDeleted: false })
    .populate('songs')
    .populate('creator', 'fullname email username');

  if (playlists.length === 0) {
    throw new AppError("No playlists found", 404);
  }

  res.status(200).json(playlists);
});

// Get playlist by ID
const getAlbumById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const playlist = await Playlist.findOne({ _id: id, isDeleted: false })
    .populate('songs')
    .populate('creator', 'fullname email username');

  if (!playlist) {
    throw new AppError("Playlist not found or already deleted", 404);
  }

  res.status(200).json(playlist);
});

// Update playlist
const updatePlaylist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    id,
    { title },
    { new: true, runValidators: true }
  ).populate('songs')
    .populate('creator', 'fullname email username');

  if (!updatedPlaylist) {
    throw new AppError("Playlist not found", 404);
  }

  res.status(200).json(updatedPlaylist);
});

// Delete playlist (soft delete)
const deletePlaylist = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedPlaylist = await Playlist.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!deletedPlaylist) {
    throw new AppError("Playlist not found", 404);
  }

  res.status(200).json({ message: "Playlist deleted successfully" });
});

// Get playlists by creator
const getPlaylistByCreator = catchAsync(async (req, res) => {
  const { creatorId } = req.params;

  const playlists = await Playlist.find({
    creator: creatorId,
    isDeleted: false
  }).populate('songs')
    .populate('creator', 'fullname email username');

  if (playlists.length === 0) {
    throw new AppError("No playlists found for this creator", 404);
  }

  res.status(200).json(playlists);
});

// Add playlist by creator
const addPlaylistByCreator = catchAsync(async (req, res) => {
  const { creatorId } = req.params;
  const { title } = req.body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const newPlaylist = new Playlist({
    title,
    creator: creatorId,
    songs: [],
    isDeleted: false,
    createdAt: Date.now(),
  });

  const savedPlaylist = await newPlaylist.save();
  const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
    .populate('songs')
    .populate('creator', 'fullname email username');

  res.status(201).json(populatedPlaylist);
});

// Add song to playlist
const addSongToPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { songTitle, songId } = req.body;

  if (!songTitle && !songId) {
    throw new AppError("Either songTitle or songId is required", 400);
  }

  let song;
  if (songId) {
    song = await Song.findOne({ _id: songId, isDeleted: false });
  } else {
    song = await Song.findOne({ title: songTitle, isDeleted: false });
  }

  if (!song) {
    throw new AppError(`Song "${songTitle || songId}" not found`, 404);
  }

  const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false });
  if (!playlist) {
    throw new AppError("Playlist not found or already deleted", 404);
  }

  if (playlist.songs.includes(song._id)) {
    throw new AppError("Song already exists in the playlist", 400);
  }

  playlist.songs.push(song._id);
  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("songs")
    .populate("creator", "fullname email username");

  res.status(200).json({
    message: "Song added successfully to the playlist",
    playlist: updatedPlaylist,
  });
});

// Remove song from playlist
const removeSongFromPlaylist = catchAsync(async (req, res) => {
  const { playlistId, songId } = req.params;

  const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false }).populate('songs');
  if (!playlist) {
    throw new AppError("Playlist not found or already deleted", 404);
  }

  const songIndex = playlist.songs.findIndex((song) => song._id.toString() === songId);
  if (songIndex === -1) {
    throw new AppError("Song not found in playlist", 404);
  }

  playlist.songs.splice(songIndex, 1);
  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId).populate('songs');

  res.status(200).json({
    message: "Song removed successfully from playlist",
    playlist: updatedPlaylist,
  });
});

// Get playlist by name (search)
const getPlaylistByName = catchAsync(async (req, res) => {
  const { title } = req.params;
  const regex = new RegExp(title, "i");

  const playlists = await Playlist.find({ title: regex, isDeleted: false })
    .populate('songs')
    .populate('creator', 'fullname email username');

  if (playlists.length === 0) {
    throw new AppError("No playlists found with this title", 404);
  }

  res.status(200).json({ success: true, playlists });
});

// Get playlists by user (with pagination)
const getUserPlaylists = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const [playlists, total] = await Promise.all([
    Playlist.find({ creator: userId, isDeleted: false })
      .populate('songs')
      .populate('creator', 'fullname email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Playlist.countDocuments({ creator: userId, isDeleted: false })
  ]);

  if (playlists.length === 0) {
    throw new AppError("No playlists found for this user", 404);
  }

  res.status(200).json({
    success: true,
    data: playlists,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Add multiple songs to playlist
const addMultipleSongsToPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { songIds } = req.body;

  if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
    throw new AppError("songIds array is required", 400);
  }

  const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false });
  if (!playlist) {
    throw new AppError("Playlist not found or already deleted", 404);
  }

  const songs = await Song.find({ _id: { $in: songIds }, isDeleted: false });
  if (songs.length === 0) {
    throw new AppError("No valid songs found", 404);
  }

  const newSongIds = songs.map(song => song._id);
  const existingSongIds = playlist.songs.map(id => id.toString());

  const songsToAdd = newSongIds.filter(
    id => !existingSongIds.includes(id.toString())
  );

  if (songsToAdd.length === 0) {
    throw new AppError("All songs already exist in the playlist", 400);
  }

  playlist.songs.push(...songsToAdd);
  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("songs")
    .populate("creator", "fullname email username");

  res.status(200).json({
    message: `${songsToAdd.length} song(s) added successfully to the playlist`,
    playlist: updatedPlaylist,
  });
});

// Remove multiple songs from playlist
const removeMultipleSongsFromPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { songIds } = req.body;

  if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
    throw new AppError("songIds array is required", 400);
  }

  const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false });
  if (!playlist) {
    throw new AppError("Playlist not found or already deleted", 404);
  }

  const initialLength = playlist.songs.length;
  playlist.songs = playlist.songs.filter(
    id => !songIds.includes(id.toString())
  );

  if (playlist.songs.length === initialLength) {
    throw new AppError("No matching songs found in playlist", 404);
  }

  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("songs")
    .populate("creator", "fullname email username");

  res.status(200).json({
    message: `${initialLength - playlist.songs.length} song(s) removed successfully from playlist`,
    playlist: updatedPlaylist,
  });
});

module.exports = {
  createPlaylist,
  getPlaylists,
  getAlbumById,
  updatePlaylist,
  deletePlaylist,
  getPlaylistByCreator,
  addPlaylistByCreator,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistByName,
  getUserPlaylists,
  addMultipleSongsToPlaylist,
  removeMultipleSongsFromPlaylist
};