const express = require("express");
const { signupValidator } = require("./validators/userValidator");
const { saveUser } = require("./middlewares/userHandler");
const { signupEndpoint } = require("./controllers/user.controller");

const router = express.Router();

router.post("/", signupValidator, saveUser, signupEndpoint);

module.exports = router;
