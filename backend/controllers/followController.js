const Follow = require("../models/Follow");
const User = require("../models/User");

class FollowController {
  // [POST] /:id
  async followUser(req, res) {
    try {
      const userId = req.user._id; // ID của người dùng hiện tại từ token
      const targetUserId = req.params.id; // ID của người dùng mà mình muốn follow

      // Kiểm tra xem người dùng target có tồn tại không
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Tìm hoặc tạo đối tượng follow của người dùng hiện tại
      let userFollow = await Follow.findOne({ user: userId });
      if (!userFollow) {
        userFollow = new Follow({ user: userId, following: [], followers: [] });
      }

      // Tìm hoặc tạo đối tượng follow của người dùng đích
      let targetUserFollow = await Follow.findOne({ user: targetUserId });
      if (!targetUserFollow) {
        targetUserFollow = new Follow({ user: targetUserId, following: [], followers: [] });
      }

      // Thêm targetUser vào danh sách following của user hiện tại
      if (!userFollow.following.includes(targetUserId)) {
        userFollow.following.push(targetUserId);
        await userFollow.save();
      }

      // Thêm user vào danh sách followers của targetUser
      if (!targetUserFollow.followers.includes(userId)) {
        targetUserFollow.followers.push(userId);
        await targetUserFollow.save();
      }

      res.status(200).json({ success: true, message: "Followed successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /:id
  async unfollowUser(req, res) {
    try {
      const userId = req.user._id; // ID của người dùng hiện tại từ token
      const targetUserId = req.params.id; // ID của người dùng mà mình muốn unfollow

      // Kiểm tra xem người dùng target có tồn tại không
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Tìm đối tượng follow của người dùng hiện tại
      const userFollow = await Follow.findOne({ user: userId });
      if (!userFollow) {
        return res.status(400).json({ success: false, message: "You are not following this user" });
      }

      // Tìm đối tượng follow của người dùng đích
      const targetUserFollow = await Follow.findOne({ user: targetUserId });
      if (!targetUserFollow) {
        return res.status(400).json({ success: false, message: "This user does not have followers" });
      }

      // Xóa targetUser khỏi danh sách following của user hiện tại
      userFollow.following = userFollow.following.filter((id) => id.toString() !== targetUserId);
      await userFollow.save();

      // Xóa user khỏi danh sách followers của targetUser
      targetUserFollow.followers = targetUserFollow.followers.filter((id) => id.toString() !== userId);
      await targetUserFollow.save();

      res.status(200).json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /follow/status/:id
  async checkFollowStatus(req, res) {
    try {
      const userId = req.user._id; // ID của người dùng hiện tại từ token
      const targetUserId = req.params.id; // ID của người dùng cần kiểm tra

      // Kiểm tra xem người dùng đích có tồn tại không
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Tìm đối tượng Follow của người dùng hiện tại
      const userFollow = await Follow.findOne({ user: userId });

      // Kiểm tra trạng thái follow
      const isFollowing = userFollow?.following.includes(targetUserId) || false;

      res.status(200).json({
        success: true,
        isFollowing,
        message: isFollowing
          ? "You are following this user"
          : "You are not following this user",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /follow/following/:id
  async getFollowing(req, res) {
    try {
      const targetUserId = req.params.id; // Lấy ID người dùng mục tiêu từ tham số URL

      const followData = await Follow.findOne({ user: targetUserId }).populate("following", "username fullname email");
      const followingList = followData ? followData.following : [];

      res.status(200).json({
        success: true,
        following: followingList,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /follow/followers
// [GET] /follow/followers/:id
  async getFollowers(req, res) {
    try {
      const targetUserId = req.params.id;

      const followData = await Follow.findOne({ user: targetUserId }).populate("followers", "fullname gender");
      const followersList = followData ? followData.followers : [];

      res.status(200).json({
        success: true,
        followers: followersList,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new FollowController();
