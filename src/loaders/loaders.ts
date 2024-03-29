import { Express } from "express";
import { dbLoader } from "./database";
import { expressLoader } from "./express";
import { routeLoader } from "./route";
import { errorHandlerLoader } from "./error";

export const appLoader = async (app: Express) => {
  await dbLoader();
  await expressLoader(app);
  await routeLoader(app);
  await errorHandlerLoader(app);
};
