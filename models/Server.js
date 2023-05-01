const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  serverName: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true, unique: true },
  traffics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Traffic" }],
  errorLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServerError" }],
  apikey: { type: String, require: true, unique: true },
});

module.exports = mongoose.model("Server", serverSchema);
