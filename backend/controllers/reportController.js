const Report = require('../models/Report');
const Song = require('../models/Song');
const User = require('../models/User');
const EStatusReport = require('../../shared/enums/EStatusReport');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new report
const createReport = catchAsync(async (req, res) => {
  const { userId, songId, reason, content } = req.body;

  if (!userId || !songId || !reason) {
    throw new AppError("Missing required fields: userId, songId, reason", 400);
  }

  const [foundSong, foundUser] = await Promise.all([
    Song.findById(songId),
    User.findById(userId)
  ]);

  if (!foundSong) {
    throw new AppError("Song not found", 404);
  }

  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  const newReport = new Report({
    user: foundUser._id,
    song: foundSong._id,
    reason,
    content: content || "",
    status: EStatusReport.PENDING,
  });

  const savedReport = await newReport.save();
  const populatedReport = await Report.findById(savedReport._id)
    .populate("user", "fullname email username")
    .populate("song", "title artist");

  res.status(201).json(populatedReport);
});

// Get reports by user ID
const getReportsByUid = catchAsync(async (req, res) => {
  const { id } = req.params;

  const reports = await Report.find({ user: id })
    .populate("song", "title artist")
    .sort({ createdAt: -1 });

  if (reports.length === 0) {
    throw new AppError("No reports found for this user", 404);
  }

  res.json(reports);
});

// Get all reports (admin)
const getReports = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) {
    query.status = status;
  }

  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate("user", "fullname email username")
      .populate("song", "title artist")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Report.countDocuments(query)
  ]);

  if (reports.length === 0) {
    throw new AppError("No reports found", 404);
  }

  res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Get report by ID
const getReportById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id)
    .populate("user", "fullname email username")
    .populate("song", "title artist");

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  res.json(report);
});

// Update report
const updateReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, feedBack } = req.body;

  if (!status && !feedBack) {
    throw new AppError("At least one field is required to update", 400);
  }

  if (status && !Object.values(EStatusReport).includes(status)) {
    throw new AppError(`Invalid status. Valid statuses: ${Object.values(EStatusReport).join(', ')}`, 400);
  }

  const report = await Report.findById(id);
  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (report.status === EStatusReport.APPROVED && status !== EStatusReport.APPROVED) {
    throw new AppError("Cannot update approved report", 400);
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (feedBack) updateData.feedBack = feedBack;

  const updatedReport = await Report.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("user", "fullname email")
    .populate("song", "title artist");

  res.status(200).json(updatedReport);
});

// Remove report (soft delete)
const removeReport = catchAsync(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id);
  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (report.status === EStatusReport.APPROVED) {
    throw new AppError("Cannot delete approved report", 403);
  }

  await Report.deleteOne({ _id: id });

  res.json({ msg: "Remove report successfully" });
});

// Approve report
const approveReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { feedBack } = req.body;

  const report = await Report.findById(id);
  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (report.status === EStatusReport.APPROVED) {
    throw new AppError("Report already approved", 400);
  }

  if (report.status === EStatusReport.REJECTED) {
    throw new AppError("Cannot approve rejected report", 400);
  }

  const updatedReport = await Report.findByIdAndUpdate(
    id,
    {
      status: EStatusReport.APPROVED,
      feedBack: feedBack || report.feedBack,
      approvedAt: new Date()
    },
    { new: true }
  ).populate("user", "fullname email")
    .populate("song", "title artist");

  res.status(200).json({
    success: true,
    message: "Report approved successfully",
    data: updatedReport
  });
});

// Reject report
const rejectReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { feedBack } = req.body;

  if (!feedBack) {
    throw new AppError("Feedback is required when rejecting report", 400);
  }

  const report = await Report.findById(id);
  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (report.status === EStatusReport.REJECTED) {
    throw new AppError("Report already rejected", 400);
  }

  if (report.status === EStatusReport.APPROVED) {
    throw new AppError("Cannot reject approved report", 400);
  }

  const updatedReport = await Report.findByIdAndUpdate(
    id,
    {
      status: EStatusReport.REJECTED,
      feedBack: feedBack,
      rejectedAt: new Date()
    },
    { new: true }
  ).populate("user", "fullname email")
    .populate("song", "title artist");

  res.status(200).json({
    success: true,
    message: "Report rejected successfully",
    data: updatedReport
  });
});

// Get report statistics
const getReportStats = catchAsync(async (req, res) => {
  const stats = await Report.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await Report.countDocuments();

  const statusCounts = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  };

  stats.forEach(stat => {
    if (stat._id === EStatusReport.PENDING) statusCounts.PENDING = stat.count;
    if (stat._id === EStatusReport.APPROVED) statusCounts.APPROVED = stat.count;
    if (stat._id === EStatusReport.REJECTED) statusCounts.REJECTED = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      ...statusCounts
    }
  });
});

// Get reports by song ID
const getReportsBySongId = catchAsync(async (req, res) => {
  const { songId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find({ song: songId })
      .populate("user", "fullname email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Report.countDocuments({ song: songId })
  ]);

  if (reports.length === 0) {
    throw new AppError("No reports found for this song", 404);
  }

  res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  createReport,
  getReportsByUid,
  getReports,
  getReportById,
  updateReport,
  removeReport,
  approveReport,
  rejectReport,
  getReportStats,
  getReportsBySongId
};