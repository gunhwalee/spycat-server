const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("./validators/inputValidator");
const { saveUserInfo, loadUserInfo } = require("./middlewares/userHandler");
const { signupEndpoint } = require("./controllers/user.controller");
const { issueToken } = require("./validators/jwt");

const router = express.Router();

router.post("/", signupValidator, saveUserInfo, signupEndpoint);
router.post("/login", loginValidator, loadUserInfo, issueToken);

module.exports = router;
