const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const expressLoader = async app => {
  app.use(
    cors({
      origin: "https://spycat.netlify.app",
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

module.exports = expressLoader;
