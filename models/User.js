const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  pw: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  servers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Server" }],
  refreshToken: { type: String },
  apikey: { type: String, require: true, unique: true },
});

module.exports = mongoose.model("User", userSchema);
