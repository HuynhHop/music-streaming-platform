const mongoose = require('mongoose');
const EStatusReport = require('../../shared/enums/EStatusReport');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    feedBack: {
        type: String,
        default: '',
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        ref: 'type',
        enum: Object.values(EStatusReport),
        required: true
    }
});

module.exports = mongoose.model('Report', reportSchema);