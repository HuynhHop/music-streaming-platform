const Favorite = require('../models/Favorite');
const Song = require('../models/Song');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new favorite
const createFavorite = catchAsync(async (req, res) => {
  const { title, songs, creator } = req.body;

  if (!title || !creator) {
    throw new AppError("Missing required fields: title and creator", 400);
  }

  const newFavorite = new Favorite({
    title,
    songs: songs || [],
    creator,
    isDeleted: false,
    createAt: Date.now(),
  });

  const savedFavorite = await newFavorite.save();
  const populatedFavorite = await Favorite.findById(savedFavorite._id)
    .populate('songs')
    .populate('creator', 'fullname email username');

  res.status(201).json(populatedFavorite);
});

// Get all favorites
const getFavorites = catchAsync(async (req, res) => {
  const favorites = await Favorite.find({ isDeleted: false })
    .populate('songs')
    .populate('creator', 'fullname email username');

  if (favorites.length === 0) {
    throw new AppError("No favorites found", 404);
  }

  res.status(200).json(favorites);
});

// Get a single favorite by ID
const getFavorite = catchAsync(async (req, res) => {
  const { id } = req.params;

  const favorite = await Favorite.findOne({ _id: id, isDeleted: false })
    .populate('songs')
    .populate('creator', 'fullname email username');

  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  res.status(200).json(favorite);
});

// Update a favorite
const updateFavorite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, songs } = req.body;

  if (!title && !songs) {
    throw new AppError("At least one field is required to update", 400);
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (songs) updateData.songs = songs;

  const updatedFavorite = await Favorite.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('songs')
    .populate('creator', 'fullname email username');

  if (!updatedFavorite) {
    throw new AppError("Favorite not found", 404);
  }

  res.status(200).json(updatedFavorite);
});

// Delete a favorite (soft delete)
const deleteFavorite = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedFavorite = await Favorite.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!deletedFavorite) {
    throw new AppError("Favorite not found", 404);
  }

  res.status(200).json({ message: "Favorite deleted successfully" });
});

// Get favorites by creator
const getFavoriteByCreator = catchAsync(async (req, res) => {
  const { creatorId } = req.params;

  const creator = await User.findById(creatorId);
  if (!creator) {
    throw new AppError("Creator not found", 404);
  }

  let favorites = await Favorite.find({
    creator: creatorId,
    isDeleted: false
  }).populate('songs').populate('creator', 'fullname email username');

  if (!favorites || favorites.length === 0) {
    const defaultFavorite = new Favorite({
      title: 'Favorites Playlist',
      creator: creatorId,
      songs: [],
      isDeleted: false,
      createAt: Date.now(),
    });

    const savedFavorite = await defaultFavorite.save();
    favorites = [await Favorite.findById(savedFavorite._id)
      .populate('songs')
      .populate('creator', 'fullname email username')];
  }

  res.status(200).json(favorites);
});

// Add a song to a favorite
const addSongToFavorite = catchAsync(async (req, res) => {
  const { favoriteId } = req.params;
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

  const favorite = await Favorite.findOne({ _id: favoriteId, isDeleted: false });
  if (!favorite) {
    throw new AppError("Favorite not found or already deleted", 404);
  }

  if (favorite.songs.includes(song._id)) {
    throw new AppError("Song already exists in the favorite", 400);
  }

  favorite.songs.push(song._id);
  await favorite.save();

  const updatedFavorite = await Favorite.findById(favoriteId)
    .populate("songs")
    .populate("creator", "fullname email username");

  res.status(200).json({
    message: "Song added successfully to the favorite",
    favorite: updatedFavorite,
  });
});

// Remove a song from a favorite
const removeSongFromFavorite = catchAsync(async (req, res) => {
  const { favoriteId, songId } = req.params;

  const favorite = await Favorite.findOne({ _id: favoriteId, isDeleted: false });
  if (!favorite) {
    throw new AppError("Favorite not found or already deleted", 404);
  }

  const songIndex = favorite.songs.findIndex(id => id.toString() === songId);
  if (songIndex === -1) {
    throw new AppError("Song not found in favorite", 404);
  }

  favorite.songs.splice(songIndex, 1);
  await favorite.save();

  const updatedFavorite = await Favorite.findById(favoriteId)
    .populate("songs")
    .populate("creator", "fullname email username");

  res.status(200).json({
    message: "Song removed successfully from favorite",
    favorite: updatedFavorite,
  });
});

// Create favorite by creator
const createFavoriteByCreator = catchAsync(async (req, res) => {
  const { creatorId } = req.params;
  const { title } = req.body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const creator = await User.findById(creatorId);
  if (!creator) {
    throw new AppError("Creator not found", 404);
  }

  const newFavorite = new Favorite({
    title,
    creator: creatorId,
    songs: [],
    isDeleted: false,
    createAt: Date.now(),
  });

  const savedFavorite = await newFavorite.save();
  const populatedFavorite = await Favorite.findById(savedFavorite._id)
    .populate('songs')
    .populate('creator', 'fullname email username');

  res.status(201).json(populatedFavorite);
});

// Update favorite by creator
const updateFavoriteByCreator = catchAsync(async (req, res) => {
  const { creatorId, favoriteId } = req.params;
  const { title } = req.body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const updatedFavorite = await Favorite.findOneAndUpdate(
    { _id: favoriteId, creator: creatorId, isDeleted: false },
    { title },
    { new: true, runValidators: true }
  ).populate('songs')
    .populate('creator', 'fullname email username');

  if (!updatedFavorite) {
    throw new AppError("Favorite not found or not authorized to update", 404);
  }

  res.status(200).json(updatedFavorite);
});

module.exports = {
  updateFavoriteByCreator,
  createFavoriteByCreator,
  createFavorite,
  getFavorites,
  getFavorite,
  updateFavorite,
  deleteFavorite,
  getFavoriteByCreator,
  addSongToFavorite,
  removeSongFromFavorite,
};