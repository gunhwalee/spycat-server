const User = require("../../../models/User");
const Server = require("../../../models/Server");

exports.loadServerName = async (req, res, next) => {
  const user = await User.findOne({ id: req.user }).populate("servers");
  res.send({
    result: "ok",
    serverList: user.servers,
  });
};
