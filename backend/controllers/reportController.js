const Report = require('../models/Report');
const Song = require('../models/Song');
const User = require('../models/User');
const EStatusReport = require('../../shared/enums/EStatusReport');

const createReport = async (req, res) => {
    try {
        const { userId, songId, reason, content } = req.body;

        const foundSong = await Song.findById(songId); 
        if (!foundSong) {
            return res.status(404).json({ message: 'Song not found' });
        }

        const foundUser = await User.findById(userId); 
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newReport = new Report({
            user: foundUser,
            song: foundSong,
            reason,
            content,
            status: EStatusReport.PENDING,
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const getReportsByUid = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.params._id });
    res.json(reports);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "fullname email")
      .populate("song", "title artist")
      .sort({ createAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params._id);
    res.json(report);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { status, feedBack } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: req.params._id },
      {
        status: status,
        feedBack: feedBack,
      },
      { new: true }
    );
    res.status(200).json(updatedReport);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const removeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params._id);
    if (!report) {
      return res.status(400).json({ msg: "Report not found" });
    } else if (report.status === EStatusReport.APPROVED) {
      return res.status(400).json({ msg: "Report has been approved" });
    }

    await Report.deleteOne({ _id: req.params._id });
    res.json({ msg: "Remove report successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createReport,
  getReportsByUid,
  getReports,
  getReportById,
  updateReport,
  removeReport,
};
