const express = require('express');
const { createComment, updateComment, removeComment, getCommentsBySongId } = require('../controllers/commentController');

const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

router.post('', verifyAccessToken, createComment);
router.patch('/:_id', verifyAccessToken, updateComment);
router.delete('/:_id', verifyAccessToken, removeComment);
router.get('/song/:songId', verifyAccessToken, getCommentsBySongId);

module.exports = router;