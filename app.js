require("dotenv").config();
const express = require("express");
const appLoader = require("./src/loaders/loaders");

const app = express();

(async () => {
  await appLoader(app);
})();

module.exports = app;
