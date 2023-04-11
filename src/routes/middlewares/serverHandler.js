const User = require("../../../models/User");
const Server = require("../../../models/Server");
const Traffic = require("../../../models/Traffic");
const ServerError = require("../../../models/Error");

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
    const user = await User.findById(req.user).populate("servers");

    res.send({
      result: "ok",
      serverList: user.servers,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createServerInfo = async (req, res, next) => {
  const apikey = req.params.id;
  const { serverName, url } = req.body;

  try {
    const hasUrl = await checkUrl(url);

    if (hasUrl) {
      return res.send({
        result: "error",
        message: "중복된 서버주소입니다.",
      });
    }

    const user = await User.findOne({ apikey });
    const server = await Server.create({ serverName, url });
    await User.findOneAndUpdate(
      { apikey },
      {
        servers: [...user.servers, server._id],
      },
    );
  } catch (err) {
    return next(err);
  }

  res.send({
    result: "ok",
    message: "서버가 정상적으로 추가됐습니다.",
  });
};

exports.updateServerInfo = async (req, res, next) => {
  const { id: apikey, serverid: url } = req.params;
  const { type, path, host, errorInfo } = req.body;

  try {
    const hasAPI = await User.findOne({ apikey });
    const server = await Server.findOne({ url });

    if (!hasAPI) {
      res.send({
        result: "error",
        message: "인증되지 않은 API Key입니다.",
      });
      return;
    }

    if (!server) {
      res.send({
        result: "error",
        message: "등록된 서버와 상이합니다. 서버목록을 확인해주세요.",
      });
      return;
    }

    if (type === "traffic") {
      const traffic = await Traffic.create({ path, host });
      await Server.findOneAndUpdate(
        { url },
        {
          traffics: [...server.traffics, traffic._id],
        },
      );
    }

    if (type === "error") {
      const serverError = await ServerError.create({ path, host, errorInfo });
      await Server.findOneAndUpdate(
        { url },
        {
          errorLists: [...server.errorLists, serverError._id],
        },
      );
    }
  } catch (err) {
    return next(err);
  }

  res.send({
    result: "ok",
  });
};
