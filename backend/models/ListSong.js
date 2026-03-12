const mongoose = require("mongoose");

const listSongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song',
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model("ListSong", listSongSchema);