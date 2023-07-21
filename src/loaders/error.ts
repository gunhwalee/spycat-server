import { Express, NextFunction, Request, Response } from "express";
import createError, { HttpError } from "http-errors";

export const errorHandlerLoader = async (app: Express) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
  });

  app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.send("error");
  });
};
