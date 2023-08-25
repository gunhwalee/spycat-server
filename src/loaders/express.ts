import express, { Express } from "express";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const whiteList = ["https://spycat.fun", "http://localhost:3000"];

const corsOptions = {
  origin: (origin: string, callback: (err: Error, allow: boolean) => void) => {
    if (whiteList.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not Allowed Origin!"), false);
  },
  credentials: true,
};

export const expressLoader = async (app: Express) => {
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
