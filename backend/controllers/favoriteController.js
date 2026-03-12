const Favorite = require('../models/Favorite');
const Song = require('../models/Song'); // Import Song model
const User = require('../models/User'); // Import Song model

// Create a new favorite
const createFavorite = async (req, res) => {
    try {
        const { title, songs, creator } = req.body;
        const newFavorite = new Favorite({
            title,
            songs,
            creator,
            isDeleted: false,
            createAt: Date.now(),
        });

        const savedFavorite = await newFavorite.save();
        res.status(201).json(savedFavorite);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

// Get all favorites
const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ isDeleted: false }).populate('songs').populate('creator');
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving favorites' });
    }
};

// Get a single favorite by ID
const getFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.find({ _id: req.params._id });
        if (!favorite || favorite.isDeleted) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.status(200).json(favorite);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving favorite' });
    }
};

// Update a favorite
const updateFavorite = async (req, res) => {
    try {
        const { title, songs } = req.body;

        const updatedFavorite = await Favorite.findByIdAndUpdate(
            { _id: req.params._id },
            { title: title, songs: songs },
            { new: true }
        );

        if (!updatedFavorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.status(200).json(updatedFavorite);
    } catch (error) {
        res.status(500).json({ error: 'Error updating favorite' });
    }
};

// Delete a favorite (soft delete)
const deleteFavorite = async (req, res) => {
    try {
        const deletedFavorite = await Favorite.findByIdAndUpdate(
            { _id: req.params._id },
            { isDeleted: true },
            { new: true }
        );

        if (!deletedFavorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.status(200).json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting favorite' });
    }
};

const getFavoriteByCreator = async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Kiểm tra xem creator có tồn tại không
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        // Tìm kiếm favorites của creator
        let favorites = await Favorite.find({
            creator: creatorId,
            isDeleted: false
        }).populate('songs').populate('creator');

        // Nếu chưa có favorites nào, tạo một favorite mặc định
        if (!favorites || favorites.length === 0) {
            const defaultFavorite = new Favorite({
                title: 'Favorites Playlist', // Tiêu đề mặc định
                creator: creatorId,
                songs: [], // Không có bài hát nào
                isDeleted: false,
                createAt: Date.now(),
            });

            // Lưu favorite mặc định vào cơ sở dữ liệu
            const savedFavorite = await defaultFavorite.save();

            // Thêm favorite mặc định vào danh sách favorites
            favorites = [savedFavorite];
        }

        // Trả về danh sách favorites
        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error retrieving or creating favorites:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

// Add a song to a favorite
const addSongToFavorite = async (req, res) => {
    try {
        const { favoriteId } = req.params; // Favorite ID from route
        const { songTitle } = req.body; // Song title from request body

        console.log("Favorite ID:", favoriteId);
        console.log("Song Title:", songTitle);

        // Find the song by title and ensure it's not deleted
        const song = await Song.findOne({ title: songTitle, isDeleted: false });
        console.log("Song found:", song);

        if (!song) {
            return res.status(404).json({ error: `Song with title "${songTitle}" not found` });
        }

        // Find the favorite by ID and ensure it's not deleted
        const favorite = await Favorite.findOne({ _id: favoriteId, isDeleted: false });
        console.log("Favorite found:", favorite);

        if (!favorite) {
            return res.status(404).json({ error: "Favorite not found or already deleted" });
        }

        // Check if the song is already in the favorite
        if (favorite.songs.includes(song._id)) {
            return res.status(400).json({ error: "Song already exists in the favorite" });
        }

        // Add the song ID to the favorite's songs array
        favorite.songs.push(song._id);
        await favorite.save();

        // Populate songs for response
        const updatedFavorite = await Favorite.findById(favoriteId).populate("songs");

        res.status(200).json({
            message: "Song added successfully to the favorite",
            favorite: updatedFavorite,
        });
    } catch (error) {
        console.error("Error adding song to favorite:", error.message);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
};


// Remove a song from a favorite
const removeSongFromFavorite = async (req, res) => {
    try {
        const { favoriteId, songId } = req.params;

        // Find the favorite
        const favorite = await Favorite.findOne({ _id: favoriteId, isDeleted: false });
        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found or already deleted' });
        }

        // Check if the song exists in the favorite
        const songIndex = favorite.songs.indexOf(songId);
        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not found in favorite' });
        }

        // Remove the song from the favorite
        favorite.songs.splice(songIndex, 1);
        await favorite.save();

        // Return the updated favorite
        const updatedFavorite = await Favorite.findById(favoriteId).populate('songs');
        res.status(200).json({
            message: 'Song removed successfully from favorite',
            favorite: updatedFavorite,
        });
    } catch (error) {
        console.error('Error removing song from favorite:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const createFavoriteByCreator = async (req, res) => {
    try {
        const { creatorId } = req.params; // Get the creatorId from route params
        const { title } = req.body; // Get title from the request body

        // Validate creator (optional, if you need to verify the creator exists in your database)
        const creator = await User.findById(creatorId); // Assuming User model exists for creators
        if (!creator) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        // Create the new favorite
        const newFavorite = new Favorite({
            title,
            creator: creatorId, // Set creator as the one passed in the params
            isDeleted: false,
            createAt: Date.now(),
        });

        // Save the new favorite
        const savedFavorite = await newFavorite.save();
        
        res.status(201).json(savedFavorite);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const updateFavoriteByCreator = async (req, res) => {
    try {
        const { creatorId, favoriteId } = req.params; // Lấy creatorId và favoriteId từ params
        const { title } = req.body; // Lấy title từ body

        // Tìm favorite theo favoriteId và đảm bảo creatorId phải trùng khớp với creator của favorite đó
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { _id: favoriteId, creator: creatorId }, // Kiểm tra điều kiện creatorId và favoriteId
            { title: title }, // Chỉ cập nhật title
            { new: true } // Trả về favorite đã cập nhật
        );

        // Nếu không tìm thấy favorite hoặc creatorId không khớp, trả về lỗi
        if (!updatedFavorite) {
            return res.status(404).json({ error: 'Favorite not found or not authorized to update' });
        }

        // Trả về favorite đã cập nhật
        res.status(200).json(updatedFavorite);
    } catch (error) {
        res.status(500).json({ error: 'Error updating favorite' });
    }
};

module.exports = { updateFavoriteByCreator, createFavoriteByCreator, createFavorite, getFavorites, getFavorite, updateFavorite, deleteFavorite, getFavoriteByCreator, addSongToFavorite, removeSongFromFavorite };
