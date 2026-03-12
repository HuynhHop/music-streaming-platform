const express = require('express');
const { createReport, getReportsByUid, getReports, getReportById, updateReport, removeReport } = require('../controllers/reportController');
const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

router.post('', verifyAccessToken, createReport);
router.post('', verifyAccessToken, createReport);
router.get('/user/:_id', verifyAccessToken, getReportsByUid);
router.get('/', verifyAccessToken, getReports);
router.get('/:_id', verifyAccessToken, getReportById);
router.patch('/:_id', verifyAccessToken, updateReport);
router.delete('/:_id', verifyAccessToken, removeReport);

module.exports = router;