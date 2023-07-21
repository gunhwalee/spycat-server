import express, { Express } from "express";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

export const expressLoader = async (app: Express) => {
  app.use(
    cors({
      origin: "https://spycat.netlify.app",
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
