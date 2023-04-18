const express = require("express");

const {
  updateServerInfo,
  loadTrafficInfo,
  loadErrorInfo,
  deleteServerInfo,
} = require("./middlewares/serverHandler");
const { checkToken } = require("./validators/jwt");

const router = express.Router();

router.get("/:serverid/traffics", checkToken, loadTrafficInfo);
router.post("/:serverid/traffics", updateServerInfo);
router.get("/:serverid/errors", checkToken, loadErrorInfo);
router.post("/:serverid/errors", updateServerInfo);
router.patch("/:serverid", checkToken, deleteServerInfo);

module.exports = router;
