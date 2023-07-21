import express from "express";
import { apiValidator, regenerateKey } from "./validators/apiValidator";
const {
  updateServerInfo,
  loadTrafficInfo,
  loadErrorInfo,
  deleteServerInfo,
} = require("./middlewares/serverHandler");
const { checkToken } = require("./validators/jwt");

export const serverRouter = express.Router();

serverRouter.get("/:apikey/traffics", apiValidator, checkToken, loadTrafficInfo);
serverRouter.post("/:apikey/traffics", apiValidator, updateServerInfo);
serverRouter.get("/:apikey/errors", apiValidator, checkToken, loadErrorInfo);
serverRouter.post("/:apikey/errors", apiValidator, updateServerInfo);
serverRouter.patch("/:url", checkToken, deleteServerInfo);
serverRouter.patch("/apikey/:apikey", apiValidator, checkToken, regenerateKey);

