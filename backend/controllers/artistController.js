const Artist = require('../models/Artist');

// Lấy danh sách nghệ sĩ
exports.getArtists = async (req, res) => {
    try {
        const artists = await Artist.find();
        res.status(200).json(artists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm nghệ sĩ mới
exports.createArtist = async (req, res) => {
    const artist = new Artist(req.body);
    try {
        const savedArtist = await artist.save();
        res.status(201).json(savedArtist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật thông tin nghệ sĩ
exports.updateArtist = async (req, res) => {
    try {
        const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedArtist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa nghệ sĩ
exports.deleteArtist = async (req, res) => {
    try {
        await Artist.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy nghệ sĩ theo ID
exports.getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }
        res.status(200).json(artist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};