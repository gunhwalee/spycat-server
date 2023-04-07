const dbLoader = require("./database");
const expressLoader = require("./express");
const routeLoader = require("./route");
const errorHandlerLoader = require("./error");

const appLoader = async app => {
  await dbLoader();
  await expressLoader(app);
  await routeLoader(app);
  await errorHandlerLoader(app);
};

module.exports = appLoader;
