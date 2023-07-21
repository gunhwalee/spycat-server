import express from "express";
const {
  signupValidator,
  loginValidator,
  serverInfoValidator,
} = require("./validators/inputValidator");
const { issueToken, checkToken } = require("./validators/jwt");
const {
  createUserInfo,
  loadUserInfo,
  removeRefreshToken,
} = require("./middlewares/userHandler");
const {
  loadServerName,
  createServerInfo,
} = require("./middlewares/serverHandler");
const { signupEndpoint } = require("./controllers/user.controller");

export const usersRouter = express.Router();

usersRouter.post("/", signupValidator, createUserInfo, signupEndpoint);
usersRouter.post("/login", loginValidator, loadUserInfo, issueToken);
usersRouter.post("/:id/logout", checkToken, removeRefreshToken);
usersRouter.get("/:id/serverlists", checkToken, loadServerName);
usersRouter.post(
  "/:id/serverlists",
  checkToken,
  serverInfoValidator,
  createServerInfo,
);
