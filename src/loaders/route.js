const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");
const serverRouter = require("../routes/server");

const routeLoader = async app => {
  app.use("/", indexRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/servers", serverRouter);
};

module.exports = routeLoader;
