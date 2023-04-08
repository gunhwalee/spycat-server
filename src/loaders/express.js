const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const expressLoader = async app => {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());
};

module.exports = expressLoader;
