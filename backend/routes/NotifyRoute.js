const express = require('express');
const { createNotify, createNotifies, removeNotify, getNotifies, isReadNotify, getNotifyByUserId } = require('../controllers/notifyController');

const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

router.post('', verifyAccessToken, createNotify);
router.post('/bulk', verifyAccessToken, createNotifies);
router.delete('/:_id', verifyAccessToken, removeNotify);
router.get('/:_id', verifyAccessToken, getNotifies);
router.get('/user/:userId', verifyAccessToken, getNotifyByUserId);
router.patch('/is-read/:_id', verifyAccessToken, isReadNotify);

module.exports = router;
