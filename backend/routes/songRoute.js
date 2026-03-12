const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const upload = require("../middleware/upload");
const { verifyAccessToken } = require("../services/jwt");
const Song = require('../models/Song')

router.post("/upload", upload.fields([
    { name: "fileMP3", maxCount: 1 },
    { name: "filePhoto", maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files.fileMP3 || !req.files.filePhoto) {
            return res.status(400).send("You must upload both audio and photo files.");
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
        res.status(201).json(newSong);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while saving the song.");
    }
});

// Lấy danh sách tất cả bài hát
router.get('/', songController.getSongs);

// Lấy thông tin chi tiết bài hát theo ID
router.get('/:id', songController.getSongById);

// Cập nhật bài hát theo ID
router.put('/:id', verifyAccessToken, songController.updateSong);
router.delete('/:id', verifyAccessToken, songController.softDeleteSong);
router.patch('/:id/restore', verifyAccessToken, songController.restoreSong);
router.delete('/:id/hard', verifyAccessToken, songController.hardDeleteSong);
router.get('/fileMP3/:filename', verifyAccessToken, songController.loadFileMP3);
router.delete('fileMP3/:filename', verifyAccessToken, songController.deleteFileMP3);
router.get('/filePhoto/:filename', verifyAccessToken, songController.loadFilePhoto);
router.delete('filePhoto/:filename', verifyAccessToken, songController.deleteFilePhoto);

router.get('/type/:type', verifyAccessToken, songController.getSongByType);

router.get('/title/:title', verifyAccessToken, songController.getSongByName);

router.get('/creator/:creator', verifyAccessToken, songController.getSongByCreator);

module.exports = router;