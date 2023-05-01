const mongoose = require("mongoose");

const connect = async () => {
  await mongoose.connect(process.env.DB_URL);
};

const dbLoader = async () => {
  mongoose.set("strictQuery", false);
  connect();

  const db = mongoose.connection;
  db.once("open", () => console.log("DB connection succeeded"));
  db.on("error", error => {
    console.error("DB connection failed");
    throw error;
  });
  db.on("disconnected", connect);
};

module.exports = dbLoader;
