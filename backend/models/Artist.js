const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    desc: { type: String },
    isValidation: { type: Boolean, default: false }
});

module.exports = mongoose.model('Artist', artistSchema);