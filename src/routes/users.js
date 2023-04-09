const express = require("express");
const {
  signupValidator,
  loginValidator,
  serverInfoValidator,
} = require("./validators/inputValidator");
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
const { issueToken, verifyToken } = require("./validators/jwt");

const router = express.Router();

router.post("/", signupValidator, createUserInfo, signupEndpoint);
router.post("/login", loginValidator, loadUserInfo, issueToken);
router.post("/:id/logout", verifyToken, removeRefreshToken);
router.get("/:id/serverlists", verifyToken, loadServerName);
router.post(
  "/:id/serverlists",
  verifyToken,
  serverInfoValidator,
  createServerInfo,
);

module.exports = router;
