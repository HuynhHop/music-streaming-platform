const Comment = require('../models/Comment');
const Song = require('../models/Song');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create comment
const createComment = catchAsync(async (req, res) => {
  const { songId, userId, content } = req.body;

  if (!songId || !userId || !content) {
    throw new AppError("Missing required fields: songId, userId, content", 400);
  }

  const foundSong = await Song.findById(songId);
  if (!foundSong) {
    throw new AppError("Song not found", 404);
  }

  const foundUser = await User.findById(userId);
  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  const newComment = new Comment({
    song: foundSong._id,
    user: foundUser._id,
    content: content.trim(),
  });

  const savedComment = await newComment.save();

  foundSong.comments.push(savedComment._id);
  await foundSong.save();

  // Populate thông tin user cho comment trả về
  const populatedComment = await Comment.findById(savedComment._id)
    .populate('user', 'fullname email username');

  res.status(201).json({ 
    message: 'Comment added successfully', 
    comment: populatedComment 
  });
});

// Update comment
const updateComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new AppError("Content is required", 400);
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { 
      content: content.trim(),
      isEdited: true,
      editedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('user', 'fullname email username');

  if (!updatedComment) {
    throw new AppError("Comment not found", 404);
  }

  res.status(200).json(updatedComment);
});

// Remove comment
const removeComment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  // Xóa comment khỏi song
  await Song.findByIdAndUpdate(
    comment.song,
    { $pull: { comments: comment._id } }
  );

  // Xóa comment
  await Comment.findByIdAndDelete(id);

  res.json({ msg: 'Remove comment successfully' });
});

// Get comments by song ID
const getCommentsBySongId = catchAsync(async (req, res) => {
  const { songId } = req.params;
  const { page = 1, limit = 20, sort = 'latest' } = req.query;

  const song = await Song.findById(songId);
  if (!song) {
    throw new AppError("Song not found", 404);
  }

  // Xây dựng sort condition
  let sortCondition = { createdAt: -1 };
  if (sort === 'oldest') sortCondition = { createdAt: 1 };
  if (sort === 'most_liked') sortCondition = { likes: -1 };

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ song: songId })
      .populate('user', 'fullname email username avatar')
      .sort(sortCondition)
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({ song: songId })
  ]);

  if (comments.length === 0) {
    throw new AppError("No comments found for this song", 404);
  }

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  createComment,
  updateComment,
  removeComment,
  getCommentsBySongId,
};