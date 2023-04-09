const User = require("../../../models/User");
const Server = require("../../../models/Server");

exports.loadServerName = async (req, res, next) => {
  const user = await User.findById(req.user);
  console.log(user);

  res.send({
    result: "ok",
    serverList: user.servers,
  });
};
