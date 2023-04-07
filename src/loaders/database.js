const mongoose = require("mongoose");

const dbLoader = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    mongoose.set("strictQuery", false);
    console.log("DB connection succeeded");
  } catch (error) {
    console.error("DB connection failed");
  }
};

module.exports = dbLoader;
