const mongoose = require("mongoose");
const listSongSchema = require("./ListSong").schema;

const playlistSchema = new mongoose.Schema({
    ...listSongSchema.obj
});

module.exports = mongoose.model("PlayList", playlistSchema);