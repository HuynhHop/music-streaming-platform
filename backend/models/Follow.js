const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người dùng sở hữu follow này
    following: [{ type: Schema.Types.ObjectId, ref: "User" }], // Danh sách người dùng mình đang theo dõi
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Danh sách người dùng đang theo dõi mình
  },
//   { timestamps: true }
);

module.exports = mongoose.model("Follow", followSchema);
