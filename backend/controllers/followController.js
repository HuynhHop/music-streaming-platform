const Follow = require("../models/Follow");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

class FollowController {
  // [POST] /follow/:id
  followUser = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const targetUserId = req.params.id;

    // Không cho phép follow chính mình
    if (userId.toString() === targetUserId) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    let userFollow = await Follow.findOne({ user: userId });
    if (!userFollow) {
      userFollow = new Follow({ user: userId, following: [], followers: [] });
    }

    let targetUserFollow = await Follow.findOne({ user: targetUserId });
    if (!targetUserFollow) {
      targetUserFollow = new Follow({ user: targetUserId, following: [], followers: [] });
    }

    if (userFollow.following.includes(targetUserId)) {
      throw new AppError("You are already following this user", 400);
    }

    userFollow.following.push(targetUserId);
    await userFollow.save();

    targetUserFollow.followers.push(userId);
    await targetUserFollow.save();

    res.status(200).json({ 
      success: true, 
      message: "Followed successfully",
      data: {
        following: userFollow.following.length,
        followers: targetUserFollow.followers.length
      }
    });
  });

  // [DELETE] /follow/:id
  unfollowUser = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const userFollow = await Follow.findOne({ user: userId });
    if (!userFollow) {
      throw new AppError("You are not following this user", 400);
    }

    const targetUserFollow = await Follow.findOne({ user: targetUserId });
    if (!targetUserFollow) {
      throw new AppError("This user does not have followers", 400);
    }

    if (!userFollow.following.includes(targetUserId)) {
      throw new AppError("You are not following this user", 400);
    }

    userFollow.following = userFollow.following.filter(
      (id) => id.toString() !== targetUserId
    );
    await userFollow.save();

    targetUserFollow.followers = targetUserFollow.followers.filter(
      (id) => id.toString() !== userId
    );
    await targetUserFollow.save();

    res.status(200).json({ 
      success: true, 
      message: "Unfollowed successfully",
      data: {
        following: userFollow.following.length,
        followers: targetUserFollow.followers.length
      }
    });
  });

  // [GET] /follow/status/:id
  checkFollowStatus = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const userFollow = await Follow.findOne({ user: userId });
    const isFollowing = userFollow?.following.includes(targetUserId) || false;

    res.status(200).json({
      success: true,
      isFollowing,
      message: isFollowing
        ? "You are following this user"
        : "You are not following this user",
    });
  });

  // [GET] /follow/following/:id
  getFollowing = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followData = await Follow.findOne({ user: id });
    const followingList = followData ? followData.following : [];

    const skip = (page - 1) * limit;
    const paginatedFollowing = followingList.slice(skip, skip + limit);

    const populatedFollowing = await User.find(
      { _id: { $in: paginatedFollowing } },
      'username fullname email avatar'
    );

    res.status(200).json({
      success: true,
      data: {
        following: populatedFollowing,
        total: followingList.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(followingList.length / limit)
      }
    });
  });

  // [GET] /follow/followers/:id
  getFollowers = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followData = await Follow.findOne({ user: id });
    const followersList = followData ? followData.followers : [];

    const skip = (page - 1) * limit;
    const paginatedFollowers = followersList.slice(skip, skip + limit);

    const populatedFollowers = await User.find(
      { _id: { $in: paginatedFollowers } },
      'fullname email avatar'
    );

    res.status(200).json({
      success: true,
      data: {
        followers: populatedFollowers,
        total: followersList.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(followersList.length / limit)
      }
    });
  });

  // [GET] /follow/stats/:id
  getFollowStats = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followData = await Follow.findOne({ user: id });
    
    res.status(200).json({
      success: true,
      data: {
        followingCount: followData?.following.length || 0,
        followersCount: followData?.followers.length || 0
      }
    });
  });

  // [GET] /follow/suggestions
  getSuggestedUsers = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const userFollow = await Follow.findOne({ user: userId });
    const followingIds = userFollow?.following || [];

    const suggestedUsers = await User.find({
      _id: { 
        $nin: [userId, ...followingIds] 
      },
      isBlocked: false
    })
      .select('username fullname email avatar')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: suggestedUsers,
      count: suggestedUsers.length
    });
  });

  // [GET] /follow/check-mutual/:id
  checkMutualFollow = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const [userFollow, targetFollow] = await Promise.all([
      Follow.findOne({ user: userId }),
      Follow.findOne({ user: targetUserId })
    ]);

    const isFollowing = userFollow?.following.includes(targetUserId) || false;
    const isFollowedBy = targetFollow?.following.includes(userId) || false;
    const isMutual = isFollowing && isFollowedBy;

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        isFollowedBy,
        isMutual
      }
    });
  });
}

module.exports = new FollowController();