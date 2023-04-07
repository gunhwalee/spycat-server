const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

const routeLoader = async app => {
  app.use("/", indexRouter);
  app.use("/users", usersRouter);
};

module.exports = routeLoader;
