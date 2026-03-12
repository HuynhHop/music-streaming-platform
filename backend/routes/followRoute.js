const express = require('express');
const followController = require("../controllers/followController");
const { verifyAccessToken } = require("../services/jwt");

const router = express.Router();

// API Follow
router.post("/:id", verifyAccessToken, followController.followUser);        // Theo dõi người dùng với id
// router.delete("/follow/:id", verifyAccessToken, followController.unfollowUser);     // Bỏ theo dõi người dùng với id
router.get("/followers/:id", verifyAccessToken, followController.getFollowers);     // Lấy danh sách người theo dõi
router.get("/following/:id", verifyAccessToken, followController.getFollowing);     // Lấy danh sách đang theo dõi
router.delete("/:id", verifyAccessToken, followController.unfollowUser);     // Lấy danh sách đang theo dõi
router.get("/status/:id", verifyAccessToken, followController.checkFollowStatus);     // Lấy danh sách đang theo dõi

module.exports = router;
