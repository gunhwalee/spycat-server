const express = require("express");

const {
  updateServerInfo,
  loadTrafficInfo,
  loadErrorInfo,
  deleteServerInfo,
} = require("./middlewares/serverHandler");

const router = express.Router();

router.get("/:serverid/traffics", loadTrafficInfo);
router.post("/:serverid/traffics", updateServerInfo);
router.get("/:serverid/errors", loadErrorInfo);
router.post("/:serverid/errors", updateServerInfo);
router.patch("/:serverid", deleteServerInfo);

module.exports = router;
