const express = require('express');
const { getAlbumByName, createAlbum, getAlbums, updateAlbum, deleteAlbum, getAlbumsByCreator, addAlbumByCreator, addSongToAlbum, getAlbumById, deleteSongFromAlbum  } = require('../controllers/albumController');
const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

router.post('/', verifyAccessToken, createAlbum);
router.get('/', verifyAccessToken, getAlbums);
router.get('/:_id', getAlbumById);
// router.get('/:_id', verifyAccessToken, getAlbum);
router.patch('/:_id', verifyAccessToken, updateAlbum);
router.delete('/:_id', verifyAccessToken, deleteAlbum);

// Route để lấy album theo creator
router.get('/creator/:creatorId', verifyAccessToken, getAlbumsByCreator);

// Route để thêm album theo creator
router.post('/creator', verifyAccessToken, addAlbumByCreator);

router.post("/:id/add-song", verifyAccessToken, addSongToAlbum);

router.delete('/:albumId/song/:songId', deleteSongFromAlbum); // Xóa bài hát khỏi playlist

router.get("/title/:title", verifyAccessToken, getAlbumByName);

module.exports = router;