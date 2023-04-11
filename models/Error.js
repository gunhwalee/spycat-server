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
  },
  { timestamps: true },
);

module.exports = mongoose.model("ServerError", errorSchema);
