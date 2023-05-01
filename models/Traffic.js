const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, expireAfterSeconds: 1 },
  server: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
});

const Traffic = mongoose.model("Traffic", trafficSchema);
const Server = mongoose.model("Server");

Traffic.watch().on("change", async change => {
  if (change.operationType === "insert") {
    const { _id } = change.documentKey;
    const expiredAt = new Date(Date.now());
    expiredAt.setSeconds(expiredAt.getSeconds() + 60 * 60 * 24 * 28);

    await Traffic.findByIdAndUpdate(_id, {
      expiredAt,
    });
  }

  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});

module.exports = Traffic;
