const express = require("express");
const logger = require("morgan");

const expressLoader = async app => {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

module.exports = expressLoader;
