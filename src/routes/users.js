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
  updateServerInfo,
} = require("./middlewares/serverHandler");
const { signupEndpoint } = require("./controllers/user.controller");
const { issueToken, checkToken } = require("./validators/jwt");

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
router.post("/:id/servers/:serverid/traffics", updateServerInfo);

module.exports = router;
