const User = require("../../../models/User");
const Server = require("../../../models/Server");

exports.loadServerName = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    res.send({
      result: "ok",
      serverList: user.servers,
    });
  } catch (err) {
    return next(err);
  }
};
