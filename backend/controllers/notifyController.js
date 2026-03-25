const ETypeNotify = require('../../shared/enums/ETypeNotify');
const Notify = require('../models/Notify');
const Song = require('../models/Song');
const Album = require('../models/Album');
const PlayList = require('../models/Playlist');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper function to find object by type
const findObjectByType = async (type, objectId) => {
  let foundObject;
  
  if (type === ETypeNotify.COMMENT || type === ETypeNotify.NEW_SONG || type === ETypeNotify.LIKE) {
    foundObject = await Song.findById(objectId);
    if (!foundObject) throw new AppError("Song not found", 404);
  } else if (type === ETypeNotify.NEW_ALBUM) {
    foundObject = await Album.findById(objectId);
    if (!foundObject) throw new AppError("Album not found", 404);
  } else if (type === ETypeNotify.NEW_PLAYLIST) {
    foundObject = await PlayList.findById(objectId);
    if (!foundObject) throw new AppError("Playlist not found", 404);
  } else if (type === ETypeNotify.FOLLOW) {
    foundObject = await User.findById(objectId);
    if (!foundObject) throw new AppError("User Object not found", 404);
  } else {
    throw new AppError(`Invalid notify type: ${type}`, 400);
  }
  
  return foundObject;
};

// Create single notify
const createNotify = catchAsync(async (req, res) => {
  const { userId, objectId, content, type } = req.body;

  if (!userId || !objectId || !type) {
    throw new AppError("Missing required fields: userId, objectId, type", 400);
  }

  const foundUser = await User.findById(userId);
  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  const foundObject = await findObjectByType(type, objectId);

  const newNotify = new Notify({
    user: foundUser._id,
    type: type,
    object: foundObject._id,
    content: content || "",
    isRead: false
  });

  const savedNotify = await newNotify.save();
  const populatedNotify = await Notify.findById(savedNotify._id)
    .populate('user', 'fullname email username')
    .populate('object');

  res.status(201).json(populatedNotify);
});

// Create multiple notifies
const createNotifies = catchAsync(async (req, res) => {
  const { users, type, objectId, content } = req.body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new AppError("Users array is required", 400);
  }

  if (!objectId || !type) {
    throw new AppError("Missing required fields: objectId, type", 400);
  }

  const foundObject = await findObjectByType(type, objectId);

  const savedNotifies = [];
  for (const userId of users) {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      throw new AppError(`User with ID ${userId} not found`, 404);
    }

    const newNotify = new Notify({
      user: foundUser._id,
      type: type,
      object: foundObject._id,
      content: content || "",
      isRead: false
    });

    const savedNotify = await newNotify.save();
    savedNotifies.push(savedNotify);
  }

  const populatedNotifies = await Notify.find({
    _id: { $in: savedNotifies.map(n => n._id) }
  })
    .populate('user', 'fullname email username')
    .populate('object');

  res.status(201).json(populatedNotifies);
});

// Remove notify
const removeNotify = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notify = await Notify.findById(id);
  if (!notify) {
    throw new AppError("Notify not found", 404);
  }

  await Notify.findByIdAndDelete(id);

  res.json({ msg: 'Remove notify successfully' });
});

// Get notifies by user ID (old version)
const getNotifies = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notifies = await Notify.find({ user: id })
    .populate('object')
    .sort({ createdAt: -1 });

  if (notifies.length === 0) {
    throw new AppError("No notifications found for this user", 404);
  }

  res.json(notifies);
});

// Mark notify as read
const isReadNotify = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notify = await Notify.findById(id);
  if (!notify) {
    throw new AppError("Notify not found", 404);
  }

  if (notify.isRead) {
    throw new AppError("Notify already marked as read", 400);
  }

  await Notify.findByIdAndUpdate(
    id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  res.json({ msg: 'Mark as read' });
});

// Get notifies by user ID with pagination
const getNotifyByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const query = { user: userId };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifies, total] = await Promise.all([
    Notify.find(query)
      .populate('object')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notify.countDocuments(query)
  ]);

  if (notifies.length === 0) {
    throw new AppError("No notifications found for this user", 404);
  }

  const unreadCount = await Notify.countDocuments({ user: userId, isRead: false });

  res.json({
    success: true,
    data: notifies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount
    }
  });
});

// Mark all notifies as read
const markAllAsRead = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await Notify.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    msg: `Marked ${result.modifiedCount} notifications as read`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// Delete all notifies of a user
const deleteAllNotifies = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await Notify.deleteMany({ user: userId });

  res.json({
    msg: `Deleted ${result.deletedCount} notifications`,
    data: { deletedCount: result.deletedCount }
  });
});

module.exports = {
  createNotify,
  createNotifies,
  removeNotify,
  getNotifies,
  isReadNotify,
  getNotifyByUserId,
  markAllAsRead,
  deleteAllNotifies
};