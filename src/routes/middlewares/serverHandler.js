const User = require("../../../models/User");
const Server = require("../../../models/Server");

const checkUrl = async url => {
  try {
    const server = await Server.findOne({ url });
    if (server) return server;
    return false;
  } catch (err) {
    throw Error(500);
  }
};

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

exports.createServerInfo = async (req, res, next) => {
  const userId = req.params.id;
  const { name, url } = req.body;

  try {
    const hasUrl = await checkUrl(url);

    if (hasUrl) {
      return res.send({
        result: "error",
        message: "중복된 서버주소입니다.",
      });
    }

    const server = await Server.create({ name, url });
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      servers: [...user.servers, server._id],
    });
  } catch (err) {
    return next(err);
  }

  res.send({
    result: "ok",
    message: "서버가 정상적으로 추가됐습니다.",
  });
};
