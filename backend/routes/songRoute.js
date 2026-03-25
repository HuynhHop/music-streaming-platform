const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const upload = require("../middleware/upload");
const { verifyAccessToken } = require("../services/jwt");

// Upload route (cần xác thực)
router.post(
  "/upload",
  verifyAccessToken,
  upload.fields([
    { name: "fileMP3", maxCount: 1 },
    { name: "filePhoto", maxCount: 1 }
  ]),
  songController.uploadSong
);

// Public routes (không cần xác thực)
router.get('/', songController.getSongs);
router.get('/:id', songController.getSongById);

// Routes cần xác thực
router.put('/:id', verifyAccessToken, songController.updateSong);
router.delete('/:id', verifyAccessToken, songController.softDeleteSong);
router.patch('/:id/restore', verifyAccessToken, songController.restoreSong);
router.delete('/:id/hard', verifyAccessToken, songController.hardDeleteSong);

// File routes
router.get('/fileMP3/:filename', songController.loadFileMP3);
router.delete('/fileMP3/:filename', verifyAccessToken, songController.deleteFileMP3);
router.get('/filePhoto/:filename', songController.loadFilePhoto);
router.delete('/filePhoto/:filename', verifyAccessToken, songController.deleteFilePhoto);

// Search routes
router.get('/type/:type', songController.getSongByType);
router.get('/title/:title', songController.getSongByName);
router.get('/creator/:creator', songController.getSongByCreator);

module.exports = router;