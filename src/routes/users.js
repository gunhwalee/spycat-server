const express = require("express");
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

const router = express.Router();

router.post("/", signupValidator, createUserInfo, signupEndpoint);
router.post("/login", loginValidator, loadUserInfo, issueToken);
router.post("/:id/logout", checkToken, removeRefreshToken);
router.get("/:id/serverlists", checkToken, loadServerName);
router.post(
  "/:id/serverlists",
  checkToken,
  serverInfoValidator,
  createServerInfo,
);

module.exports = router;
