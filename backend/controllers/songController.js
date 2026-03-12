const Song = require('../models/Song');
const mongoose = require('mongoose');
const Grid = require("gridfs-stream");

let gfsAudios, gfsPhotos;
const conn = mongoose.connection;

conn.once('open', function () {
  gfsAudios = Grid(conn.db, mongoose.mongo);
  gfsAudios.collection("audios");

  gfsPhotos = Grid(conn.db, mongoose.mongo);
  gfsPhotos.collection("photos");
});

exports.getSongs = async (req, res) => {
  try {
    const songs = await Song.find({ isDeleted: false }).populate(
      "artist creator"
    );
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id).populate("artist creator");

    if (!song || song.isDeleted) {
      return res
        .status(404)
        .json({ message: "Bài hát không tồn tại hoặc đã bị xóa." });
    }

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || song.isDeleted) {
      return res.status(404).json({ message: "Bài hát không tồn tại." });
    }

    Object.assign(song, req.body, { updatedAt: new Date() });
    await song.save();

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loadFileMP3 = async (req, res) => {
    try {
        const file = await gfsAudios.files.findOne({ filename: req.params.filename });
        const readStream = gfsAudios.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFileMP3 = async (req, res) => {
    try {
        await gfsAudios.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
};
exports.loadFilePhoto = async (req, res) => {
    try {
        const file = await gfsPhotos.files.findOne({ filename: req.params.filename });
        const readStream = gfsPhotos.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFilePhoto = async (req, res) => {
    try {
        await gfsPhotos.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
};

exports.softDeleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || song.isDeleted) {
      return res.status(404).json({ message: "Bài hát không tồn tại." });
    }

    song.isDeleted = true;
    await song.save();

    res.status(200).json({ message: "Đã xóa bài hát." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || !song.isDeleted) {
      return res
        .status(404)
        .json({ message: "Bài hát không tồn tại hoặc không cần khôi phục." });
    }

    song.isDeleted = false;
    await song.save();

    res.status(200).json({ message: "Đã khôi phục bài hát." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.hardDeleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Bài hát không tồn tại." });
    }

    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Đã xóa hoàn toàn bài hát." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSongByType = async (req, res) => {
  try {
    const { type } = req.params;
    const songs = await Song.find({ type, isDeleted: false }).populate(
      "artist creator comments"
    );
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSongByName = async (req, res) => {
  try {
    const { title } = req.params;

    // Tạo regex để tìm kiếm tiêu đề khớp một phần (không phân biệt hoa thường)
    const regex = new RegExp(title, "i"); // "i" để tìm kiếm không phân biệt hoa thường

    const songs = await Song.find({ title: regex, isDeleted: false }).populate(
      "artist creator comments"
    );

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSongByCreator = async (req, res) => {
  try {
    const { creator } = req.params;
    const songs = await Song.find({ creator, isDeleted: false }).populate(
      "artist creator comments"
    );
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
