import express from "express";
import { signupValidator, loginValidator, serverInfoValidator } from "./validators/inputValidator";
import { issueToken, checkToken } from "./validators/jwt";
import { createUserInfo, loadUserInfo, removeRefreshToken } from "./middlewares/userHandler";
import { loadServerName, createServerInfo } from "./middlewares/serverHandler";
import { signupEndpoint } from "./controllers/user.controller";

export const usersRouter = express.Router();

usersRouter.post("/", signupValidator, createUserInfo, signupEndpoint);
usersRouter.post("/login", loginValidator, loadUserInfo, issueToken);
usersRouter.post("/:id/logout", checkToken, removeRefreshToken);
usersRouter.get("/:id/serverlists", checkToken, loadServerName);
usersRouter.post("/:id/serverlists", checkToken, serverInfoValidator, createServerInfo);
