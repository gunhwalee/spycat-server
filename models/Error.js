const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, trim: true },
    host: { type: String, required: true, trim: true },
    errorInfo: {
      type: { type: String, required: true },
      message: { type: String, required: true },
      stack: { type: String, required: true },
    },
    createdAt: { type: Date, expires: 2419200, default: Date.now },
  },
  { timestamps: true },
);

const ServerError = mongoose.model("ServerError", errorSchema);
const Server = mongoose.model("Server");

ServerError.watch().on("change", async change => {
  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});

module.exports = ServerError;
