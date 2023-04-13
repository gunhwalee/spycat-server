const mongoose = require("mongoose");
const { getCurrentDate } = require("../src/uilts/getCurrentDate");

const errorSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  errorInfo: {
    type: { type: String, required: true },
    message: { type: String, required: true },
    stack: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, expireAfterSeconds: 1 },
});

const ServerError = mongoose.model("ServerError", errorSchema);
const Server = mongoose.model("Server");

ServerError.watch().on("change", async change => {
  if (change.operationType === "insert") {
    const { _id } = change.documentKey;
    const koreaTime = getCurrentDate();
    koreaTime.setSeconds(koreaTime.getSeconds() + 60 * 60 * 24 * 28);

    await ServerError.findByIdAndUpdate(_id, {
      expiredAt: koreaTime,
    });
  }

  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});

module.exports = ServerError;
