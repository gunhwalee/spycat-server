const createError = require("http-errors");

const errorHandlerLoader = async app => {
  app.use((req, res, next) => {
    next(createError(404));
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.send("error");
  });
};

module.exports = errorHandlerLoader;
