const Artist = require('../models/Artist');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Lấy danh sách nghệ sĩ
const getArtists = catchAsync(async (req, res) => {
  const artists = await Artist.find();
  
  if (artists.length === 0) {
    throw new AppError("No artists found", 404);
  }
  
  res.status(200).json(artists);
});

// Thêm nghệ sĩ mới
const createArtist = catchAsync(async (req, res) => {
  const { fullName, desc, isValidation } = req.body;
  
  if (!fullName) {
    throw new AppError("Artist name is required", 400);
  }
  
  // Kiểm tra nghệ sĩ đã tồn tại
  const existingArtist = await Artist.findOne({ fullName });
  if (existingArtist) {
    throw new AppError("Artist already exists", 400);
  }
  
  const artist = new Artist({
    fullName,
    desc: desc || "",
    isValidation: isValidation || false
  });
  
  const savedArtist = await artist.save();
  res.status(201).json(savedArtist);
});

// Cập nhật thông tin nghệ sĩ
const updateArtist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { fullName, desc, isValidation } = req.body;
  
  if (!fullName && !desc && isValidation === undefined) {
    throw new AppError("At least one field is required to update", 400);
  }
  
  const artist = await Artist.findById(id);
  if (!artist) {
    throw new AppError("Artist not found", 404);
  }
  
  // Kiểm tra trùng tên nếu cập nhật fullName
  if (fullName && fullName !== artist.fullName) {
    const existingArtist = await Artist.findOne({ fullName });
    if (existingArtist) {
      throw new AppError("Artist name already exists", 400);
    }
  }
  
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (desc !== undefined) updateData.desc = desc;
  if (isValidation !== undefined) updateData.isValidation = isValidation;
  
  const updatedArtist = await Artist.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedArtist);
});

// Xóa nghệ sĩ
const deleteArtist = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const artist = await Artist.findById(id);
  if (!artist) {
    throw new AppError("Artist not found", 404);
  }
  
  // Kiểm tra xem nghệ sĩ có bài hát nào không
  const Song = require('../models/Song');
  const songsCount = await Song.countDocuments({ artist: id, isDeleted: false });
  
  if (songsCount > 0) {
    throw new AppError(`Cannot delete artist with ${songsCount} associated songs. Please reassign or delete songs first.`, 400);
  }
  
  await Artist.findByIdAndDelete(id);
  res.status(204).send();
});

// Lấy nghệ sĩ theo ID
const getArtistById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const artist = await Artist.findById(id);
  
  if (!artist) {
    throw new AppError("Artist not found", 404);
  }
  
  res.status(200).json(artist);
});

module.exports = {
  getArtists,
  createArtist,
  updateArtist,
  deleteArtist,
  getArtistById,
};