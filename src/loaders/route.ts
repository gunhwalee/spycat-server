import { Express } from "express";

import { indexRouter } from "../routes/index";
import { usersRouter } from "../routes/users";
import { serverRouter } from "../routes/server";

export const routeLoader = async (app: Express) => {
  app.use("/", indexRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/servers", serverRouter);
};
