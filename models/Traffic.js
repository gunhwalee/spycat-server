const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, trim: true },
    host: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Traffic", trafficSchema);
