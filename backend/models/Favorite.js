const mongoose = require("mongoose");
const listSongSchema = require("./ListSong").schema;

const favoriteSchema = new mongoose.Schema({
    ...listSongSchema.obj
});

module.exports = mongoose.model("Favorite", favoriteSchema);