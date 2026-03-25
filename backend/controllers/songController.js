const Song = require('../models/Song');
const History = require('../models/History');
const mongoose = require('mongoose');
const Grid = require("gridfs-stream");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

let gfsAudios, gfsPhotos;
const conn = mongoose.connection;

conn.once('open', function () {
  gfsAudios = Grid(conn.db, mongoose.mongo);
  gfsAudios.collection("audios");

  gfsPhotos = Grid(conn.db, mongoose.mongo);
  gfsPhotos.collection("photos");
});

class SongController {
  // [POST] /songs/upload
  uploadSong = catchAsync(async (req, res) => {
    if (!req.files || !req.files.fileMP3 || !req.files.filePhoto) {
      throw new AppError("You must upload both audio and photo files", 400);
    }

    const songUrl = `http://localhost:5000/api/songs/fileMP3/${req.files.fileMP3[0].filename}`;
    const imgUrl = `http://localhost:5000/api/songs/filePhoto/${req.files.filePhoto[0].filename}`;

    const newSong = new Song({
      title: req.body.title,
      type: req.body.type,
      artist: req.body.artist || null,
      desc: req.body.desc,
      lyrics: req.body.lyrics,
      creator: req.body.creator,
      linkImg: imgUrl,
      linkSong: songUrl
    });

    await newSong.save();
    const populatedSong = await Song.findById(newSong._id)
      .populate('artist')
      .populate('creator', 'fullname email username');

    res.status(201).json(populatedSong);
  });

  // [GET] /songs
  getSongs = catchAsync(async (req, res) => {
    const songs = await Song.find({ isDeleted: false })
      .populate("artist")
      .populate("creator", "fullname email username");

    if (songs.length === 0) {
      throw new AppError("No songs found", 404);
    }

    res.status(200).json(songs);
  });

  // [GET] /songs/:id
  getSongById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const song = await Song.findById(id)
      .populate('artist')
      .populate('creator', 'fullname email username');

    if (!song || song.isDeleted) {
      throw new AppError("Song not found or has been deleted", 404);
    }

    // Track listening history
    if (req.user?._id) {
      setImmediate(async () => {
        try {
          const recentHistory = await History.findOne({
            user: req.user._id,
            song: song._id,
            listenedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
          });

          if (!recentHistory) {
            await History.create({
              user: req.user._id,
              song: song._id,
              listenedAt: new Date(),
              completed: true
            });

            await Song.findByIdAndUpdate(song._id, { $inc: { listenCount: 1 } });
          }
        } catch (error) {
          console.error('Error tracking:', error);
        }
      });
    }

    res.status(200).json(song);
  });

  // [PUT] /songs/:id
  updateSong = catchAsync(async (req, res) => {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song || song.isDeleted) {
      throw new AppError("Song not found", 404);
    }

    Object.assign(song, req.body, { updatedAt: new Date() });
    await song.save();

    const updatedSong = await Song.findById(id)
      .populate('artist')
      .populate('creator', 'fullname email username');

    res.status(200).json(updatedSong);
  });

  // [GET] /songs/fileMP3/:filename
  loadFileMP3 = catchAsync(async (req, res) => {
    const { filename } = req.params;

    const file = await gfsAudios.files.findOne({ filename });
    if (!file) {
      throw new AppError("Audio file not found", 404);
    }

    const readStream = gfsAudios.createReadStream(file.filename);
    readStream.pipe(res);
  });

  // [DELETE] /songs/fileMP3/:filename
  deleteFileMP3 = catchAsync(async (req, res) => {
    const { filename } = req.params;

    const result = await gfsAudios.files.deleteOne({ filename });
    if (result.deletedCount === 0) {
      throw new AppError("Audio file not found", 404);
    }

    res.status(200).json({ success: true, message: "Audio file deleted successfully" });
  });

  // [GET] /songs/filePhoto/:filename
  loadFilePhoto = catchAsync(async (req, res) => {
    const { filename } = req.params;

    const file = await gfsPhotos.files.findOne({ filename });
    if (!file) {
      throw new AppError("Photo file not found", 404);
    }

    const readStream = gfsPhotos.createReadStream(file.filename);
    readStream.pipe(res);
  });

  // [DELETE] /songs/filePhoto/:filename
  deleteFilePhoto = catchAsync(async (req, res) => {
    const { filename } = req.params;

    const result = await gfsPhotos.files.deleteOne({ filename });
    if (result.deletedCount === 0) {
      throw new AppError("Photo file not found", 404);
    }

    res.status(200).json({ success: true, message: "Photo file deleted successfully" });
  });

  // [PATCH] /songs/:id/soft-delete
  softDeleteSong = catchAsync(async (req, res) => {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) {
      throw new AppError("Song not found", 404);
    }

    if (song.isDeleted) {
      throw new AppError("Song is already deleted", 400);
    }

    song.isDeleted = true;
    await song.save();

    res.status(200).json({ success: true, message: "Song deleted successfully" });
  });

  // [PATCH] /songs/:id/restore
  restoreSong = catchAsync(async (req, res) => {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) {
      throw new AppError("Song not found", 404);
    }

    if (!song.isDeleted) {
      throw new AppError("Song is not deleted", 400);
    }

    song.isDeleted = false;
    await song.save();

    res.status(200).json({ success: true, message: "Song restored successfully" });
  });

  // [DELETE] /songs/:id/hard
  hardDeleteSong = catchAsync(async (req, res) => {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) {
      throw new AppError("Song not found", 404);
    }

    await Song.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Song permanently deleted" });
  });

  // [GET] /songs/type/:type
  getSongByType = catchAsync(async (req, res) => {
    const { type } = req.params;

    const songs = await Song.find({ type, isDeleted: false })
      .populate("artist")
      .populate("creator", "fullname email username");

    if (songs.length === 0) {
      throw new AppError(`No songs found with type: ${type}`, 404);
    }

    res.status(200).json(songs);
  });

  // [GET] /songs/title/:title
  getSongByName = catchAsync(async (req, res) => {
    const { title } = req.params;
    const regex = new RegExp(title, "i");

    const songs = await Song.find({ title: regex, isDeleted: false })
      .populate("artist")
      .populate("creator", "fullname email username");

    if (songs.length === 0) {
      throw new AppError(`No songs found with title: ${title}`, 404);
    }

    res.status(200).json(songs);
  });

  // [GET] /songs/creator/:creator
  getSongByCreator = catchAsync(async (req, res) => {
    const { creator } = req.params;

    const songs = await Song.find({ creator, isDeleted: false })
      .populate("artist")
      .populate("creator", "fullname email username");

    if (songs.length === 0) {
      throw new AppError(`No songs found for creator: ${creator}`, 404);
    }

    res.status(200).json(songs);
  });
}

module.exports = new SongController();