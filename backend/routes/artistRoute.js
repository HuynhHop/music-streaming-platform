const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { verifyAccessToken } = require("../services/jwt");

router.get('/', verifyAccessToken,artistController.getArtists);
router.post('/', verifyAccessToken, artistController.createArtist);
router.put('/:id', verifyAccessToken, artistController.updateArtist);
router.delete('/:id', verifyAccessToken, artistController.deleteArtist);
router.get('/:id', verifyAccessToken, artistController.getArtistById);

module.exports = router;