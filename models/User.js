const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  pw: { type: String, required: true, trim: true },
  name: { type: String, required: true, unique: true, trim: true },
  servers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Server" }],
  refreshToken: { type: String },
});

module.exports = mongoose.model("User", userSchema);
