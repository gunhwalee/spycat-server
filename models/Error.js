const mongoose = require("mongoose");
const { getCurrentDate } = require("../src/uilts/getCurrentDate");

const errorSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  errorName: { type: String },
  errorMessage: { type: String, required: true },
  errorStack: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, expireAfterSeconds: 1 },
  server: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
});

const ServerError = mongoose.model("ServerError", errorSchema);
const Server = mongoose.model("Server");

ServerError.watch().on("change", async change => {
  if (change.operationType === "insert") {
    const { _id } = change.documentKey;
    const expiredAt = new Date(Date.now());
    console.log(expiredAt);
    expiredAt.setSeconds(expiredAt.getSeconds() + 60 * 60 * 24 * 28);

    await ServerError.findByIdAndUpdate(_id, {
      expiredAt,
    });
  }

  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});

module.exports = ServerError;
