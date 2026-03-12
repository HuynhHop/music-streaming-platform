const mongoose = require("mongoose");
const listSongSchema = require("./ListSong").schema;

const albumSchema = new mongoose.Schema({
    ...listSongSchema.obj,
    desc: {
        type: String,
        required: true,
    },
    linkImg: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Album", albumSchema);