const express = require('express');
const { getPlaylistByName, removeSongFromPlaylist, addSongToPlaylist, addPlaylistByCreator, createPlaylist, getPlaylists, getAlbumById, updatePlaylist, deletePlaylist, getPlaylistByCreator } = require('../controllers/playlistController');
const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

router.get('/title/:title', verifyAccessToken, getPlaylistByName);
router.post('/', verifyAccessToken, createPlaylist);
router.get('/', verifyAccessToken, getPlaylists);
router.get('/:_id', getAlbumById);
router.patch('/:_id', verifyAccessToken, updatePlaylist);
router.delete('/:_id', verifyAccessToken, deletePlaylist);
router.get('/creator/:creatorId', getPlaylistByCreator);
router.post('/creator/:creatorId/add',verifyAccessToken, addPlaylistByCreator);
router.put("/:playlistId/song", addSongToPlaylist);

router.delete('/:playlistId/song/:songId', removeSongFromPlaylist); // Xóa bài hát khỏi playlist

module.exports = router;