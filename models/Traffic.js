const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, trim: true },
    host: { type: String, required: true, trim: true },
    createdAt: { type: Date, expires: 2419200, default: Date.now },
  },
  { timestamps: true },
);

const Traffic = mongoose.model("Traffic", trafficSchema);
const Server = mongoose.model("Server");

Traffic.watch().on("change", async change => {
  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});

module.exports = Traffic;
