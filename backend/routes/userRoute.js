const express = require('express');
// const { createComment, updateComment, removeComment } = require('../controllers/userController');

const userController = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const { verifyAccessToken, isAdmin } = require("../services/jwt");

const router = express.Router();

// API User
router.post("/login", userController.login);
router.get("/name/:fullname", verifyAccessToken, userController.getUserByName);
router.get("/getUserToken", verifyAccessToken, userController.getUserFromToken);
router.get("/forgotPassword", userController.forgotPassword);
router.get("/editProfileSendOTP", userController.editProfileSendOTP);
router.post("/sendOTP", userController.sendOTP);
router.get("/resetPassword/:resetToken", userController.getResetToken);
router.get("/:id", userController.getById);
router.get("/", [verifyAccessToken, isAdmin], userController.getAll);

router.post("/current", verifyAccessToken, userController.current);
router.post("/register", userController.register);


router.put("/refreshAccessToken", userController.refreshAccessToken);
router.put("/resetPassword",verifyAccessToken, userController.resetPassword);
router.put("/:uid", verifyAccessToken, isAdmin, userController.updateByAdmin);
router.put("/", verifyAccessToken, userController.update);

router.delete(
  "/:id/force",
  [verifyAccessToken, isAdmin],
  userController.forceDelete
);
router.delete("/:id", verifyAccessToken, userController.forceDelete);

router.patch("/:id/restore", userController.restore);

router.post("/heartbeat", verifyAccessToken, userController.heartbeat);

// API Role
router.get("/role/:id", roleController.getById);
router.get("/role/", roleController.getAll);
router.post("/role/store", [verifyAccessToken, isAdmin], roleController.store);
router.put("/role/:id", [verifyAccessToken, isAdmin], roleController.update);
router.delete(
  "/role/:id/force",
  [verifyAccessToken, isAdmin],
  roleController.forceDelete
);
router.delete("/role/:id", [verifyAccessToken, isAdmin], roleController.delete);
router.patch(
  "/role/:id/restore",
  [verifyAccessToken, isAdmin],
  roleController.restore
);

module.exports = router;