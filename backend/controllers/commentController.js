const Comment = require('../models/Comment');
const Song = require('../models/Song');
const User = require('../models/User');

const createComment = async (req, res) => {
    try {
        const { songId, userId, content } = req.body;

        const foundSong = await Song.findById({_id: songId});
        if (!foundSong) {
            return res.status(404).json({ message: 'Song not found' });
        }
        const foundUser = await User.findById({_id: userId});
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newComment = new Comment({
            song: foundSong,
            user: foundUser,
            content: content,
        });

        const savedComment = await newComment.save();
    
        foundSong.comments.push(savedComment);
        await foundSong.save();
        res.status(201).json({ message: 'Comment added successfully', comment: savedComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const updatedComment = await Comment.findOneAndUpdate({ _id: req.params._id }, 
            {content: content},
            { new: true });
        res.status(200).json(updatedComment);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const removeComment = async (req, res) => {
    try {
        await Comment.deleteOne({ _id: req.params._id });
        res.json({ msg: 'Remove comment successfully' });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const getCommentsBySongId = async (req, res) => {
    try {
        const comments = await Comment.find({ song: req.params.songId }).populate('user');
        res.json(comments);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

module.exports = { createComment, updateComment, removeComment, getCommentsBySongId};