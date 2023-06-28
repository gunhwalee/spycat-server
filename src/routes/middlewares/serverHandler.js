const { v4: uuidv4 } = require("uuid");
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
  const { id } = req.params;
  const { serverName, url } = req.body;

  try {
    const hasUrl = await checkUrl(url);

    if (hasUrl) {
      return res.send({
        result: "error",
        message: "중복된 서버주소입니다.",
      });
    }

    const apikey = uuidv4();
    const user = await User.findById(id);
    const server = await Server.create({ serverName, url, apikey });
    await User.findByIdAndUpdate(id, {
      servers: [...user.servers, server._id],
    });

    res.send({
      result: "ok",
      message: "서버가 정상적으로 추가됐습니다.",
      server,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateServerInfo = async (req, res, next) => {
  const { apikey } = req.params;
  const { type, path, host, errorName, errorMessage, errorStack } = req.body;

  try {
    const server = await Server.findOne({ apikey });

    if (!server) {
      res.send({
        result: "error",
        message: "등록된 서버가 없습니다.",
      });
      return;
    }

    if (type === "traffic") {
      const traffic = await Traffic.create({ path, host, server: server._id });
      await Server.findOneAndUpdate(
        { apikey },
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
        server: server._id,
      });
      await Server.findOneAndUpdate(
        { apikey },
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
    message: "전송된 정보가 서버에 정상등록 됐습니다.",
  });
};

exports.loadTrafficInfo = async (req, res, next) => {
  const { apikey } = req.params;

  try {
    const server = await Server.findOne({ apikey }).populate("traffics");

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
  const { apikey } = req.params;

  try {
    const server = await Server.findOne({ apikey }).populate("errorLists");

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
  const { url } = req.params;

  try {
    const server = await Server.findOne({ url });

    await Server.findOneAndDelete({ url });
    await Traffic.deleteMany({ server: server._id });
    await ServerError.deleteMany({ server: server._id });

    const user = await User.findById(req.user);
    const newServers = user.servers.filter(
      element => !element.equals(server._id),
    );

    const newUser = await User.findByIdAndUpdate(user._id, {
      servers: newServers,
    });

    res.send({ result: "ok", servers: newUser.servers });
  } catch (err) {
    return next(err);
  }
};
