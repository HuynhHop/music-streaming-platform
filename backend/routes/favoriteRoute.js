const express = require('express');
const { verifyAccessToken } = require("../services/jwt");
const { 
    createFavorite, 
    getFavorites, 
    getFavorite, 
    updateFavorite, 
    deleteFavorite, 
    getFavoriteByCreator, 
    addSongToFavorite, 
    removeSongFromFavorite, createFavoriteByCreator , updateFavoriteByCreator
} = require('../controllers/favoriteController');

const router = express.Router();

router.post('/', verifyAccessToken, createFavorite);
router.get('/', verifyAccessToken, getFavorites);
router.get('/:_id', verifyAccessToken, getFavorite);
router.patch('/:_id', verifyAccessToken, updateFavorite);
router.delete('/:_id', verifyAccessToken, deleteFavorite);

router.get('/creator/:creatorId', verifyAccessToken, getFavoriteByCreator); // Get favorites by creator
router.post('/:favoriteId/song', verifyAccessToken, addSongToFavorite); // Add song to favorite
router.delete('/:favoriteId/song/:songId', verifyAccessToken, removeSongFromFavorite); // Remove song from favorite

router.post('/creator/:creatorId', verifyAccessToken, createFavoriteByCreator); // Create favorite by creator

router.patch('/creator/:creatorId/:favoriteId', verifyAccessToken, updateFavoriteByCreator); // Update favorite by creator

module.exports = router;
