const express = require("express");

const {
  updateServerInfo,
  loadServerInfo,
} = require("./middlewares/serverHandler");

const router = express.Router();

router.get("/:serverid/traffics", loadServerInfo);
router.post("/:serverid/traffics", updateServerInfo);
router.post("/:serverid/errors", updateServerInfo);

module.exports = router;
