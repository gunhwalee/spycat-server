const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true, unique: true },
  traffics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Traffic" }],
  errorsList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Error" }],
});

module.exports = mongoose.model("Server", serverSchema);
