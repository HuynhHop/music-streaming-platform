const mongoose = require('mongoose');
const ETypeNotify = require('../../shared/enums/ETypeNotify');

const notifySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        ref: 'type',
        enum: Object.values(ETypeNotify),
        required: true
    },
    object: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Notify', notifySchema);