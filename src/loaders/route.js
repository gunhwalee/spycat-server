const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

const routeLoader = async app => {
  app.use("/", indexRouter);
  app.use("/api/users", usersRouter);
};

module.exports = routeLoader;
