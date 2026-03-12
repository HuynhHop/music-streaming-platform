const mongoose = require('mongoose');
const ETypeNotify = require('../../shared/enums/ETypeSong');
const { compare } = require('bcrypt');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: Object.values(ETypeNotify), required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: false, default: null },
    desc: { type: String },
    lyrics: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    linkImg: { type: String },
    linkSong: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    totalPlays: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],   
});

module.exports = mongoose.model('Song', songSchema);
