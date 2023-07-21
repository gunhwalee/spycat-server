import mongoose from "mongoose";

export const Server = new mongoose.Schema({
  serverName: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true, unique: true },
  traffics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Traffic" }],
  errorLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServerError" }],
  apikey: { type: String, require: true, unique: true },
});

mongoose.model("Server", Server);
// module.exports = mongoose.model("Server", serverSchema);
