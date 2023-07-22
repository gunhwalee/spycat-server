import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { appLoader } from "./src/loaders/loaders";

const app = express();

(async () => {
  await appLoader(app);
})();

module.exports = app;
