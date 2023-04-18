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
      servers: user.servers,
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
  const url = req.params.serverid;
  const { type, path, host, errorName, errorMessage, errorStack } = req.body;

  try {
    const server = await Server.findOne({ url });

    if (!server) {
      res.send({
        result: "error",
        message: "등록된 서버가 없습니다.",
      });
      return;
    }

    if (url !== host) {
      res.send({
        result: "error",
        message: "서버주소를 다시 확인해주세요.",
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
      const serverError = await ServerError.create({
        path,
        host,
        errorName,
        errorMessage,
        errorStack,
      });
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

exports.loadTrafficInfo = async (req, res, next) => {
  const url = req.params.serverid;

  try {
    const server = await Server.findOne({ url }).populate("traffics");

    if (!server) {
      res.send({
        result: "error",
        message: "등록된 서버가 없습니다. 서버주소를 다시 확인해주세요.",
      });
      return;
    }

    res.send({
      result: "ok",
      serverName: server.serverName,
      url: server.url,
      traffics: server.traffics,
    });
  } catch (err) {
    return next(err);
  }
};

exports.loadErrorInfo = async (req, res, next) => {
  const url = req.params.serverid;

  try {
    const server = await Server.findOne({ url }).populate("errorLists");

    if (!server) {
      res.send({
        result: "error",
        message: "등록된 서버가 없습니다. 서버주소를 다시 확인해주세요.",
      });
      return;
    }

    res.send({
      result: "ok",
      serverName: server.serverName,
      url: server.url,
      errorLists: server.errorLists,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteServerInfo = async (req, res, next) => {
  const url = req.params.serverid;

  try {
    await Server.findOneAndDelete({ url });
    const user = await User.findById(req.user).populate("servers");
    const newServers = user.servers.filter(element => element.url !== url);
    await User.findByIdAndUpdate(user._id, { servers: newServers });
  } catch (err) {
    return next(err);
  }
  console.log(req.user, url);

  res.send({ result: "ok" });
};
