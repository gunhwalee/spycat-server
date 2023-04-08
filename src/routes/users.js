const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("./validators/inputValidator");
const { saveUserInfo, loadUserInfo } = require("./middlewares/userHandler");
const { loadServerName } = require("./middlewares/serverHandler");
const { signupEndpoint } = require("./controllers/user.controller");
const { issueToken, verifyToken } = require("./validators/jwt");

const router = express.Router();

router.post("/", signupValidator, saveUserInfo, signupEndpoint);
router.post("/login", loginValidator, loadUserInfo, issueToken);
router.get("/:id/serverlists", verifyToken, loadServerName);

module.exports = router;
