const express = require("express");
const { apiValidator, regenerateKey } = require("./validators/apiValidator");
const {
  updateServerInfo,
  loadTrafficInfo,
  loadErrorInfo,
  deleteServerInfo,
} = require("./middlewares/serverHandler");
const { checkToken } = require("./validators/jwt");

const router = express.Router();

router.get("/:apikey/traffics", apiValidator, checkToken, loadTrafficInfo);
router.post("/:apikey/traffics", apiValidator, updateServerInfo);
router.get("/:apikey/errors", apiValidator, checkToken, loadErrorInfo);
router.post("/:apikey/errors", apiValidator, updateServerInfo);
router.patch("/:url", checkToken, deleteServerInfo);
router.patch("/apikey/:apikey", apiValidator, checkToken, regenerateKey);

module.exports = router;
