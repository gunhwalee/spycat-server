const jwt = require("jsonwebtoken");
const User = require("../../../models/User");

exports.issueToken = async (req, res, next) => {
  const accessToken = jwt.sign({ id: req.user }, process.env.ACCESS_TOKEN, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign({ id: req.user }, process.env.REFRESH_TOKEN, {
    expiresIn: "1d",
  });

  try {
    const user = await User.findByIdAndUpdate(req.user, { refreshToken });
    const { name, apikey, id } = user;

    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
      })
      .send({
        result: "ok",
        message: "정상적으로 로그인됐습니다.",
        name,
        apikey,
        id,
      });
  } catch (err) {
    return next(err);
  }
};

const accessTokenVerify = token => {
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN);
    return decode.id;
  } catch (err) {
    if (err.name === "TokenExpiredError") return null;
  }
};

const refreshTokenVerify = async (token, id) => {
  try {
    const user = await User.findOne({ apikey: id });

    if (token === user.refreshToken) {
      jwt.verify(token, process.env.REFRESH_TOKEN);
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: "30m",
        },
      );

      return { newAccessToken, refreshPayload: user._id };
    }
  } catch (err) {
    throw Error(500);
  }
};

exports.checkToken = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  try {
    if (accessToken && refreshToken) {
      const payload = accessTokenVerify(accessToken);

      if (payload) {
        req.user = payload;
        return next();
      }
    }

    const { newAccessToken, refreshPayload } = await refreshTokenVerify(
      refreshToken,
      req.params.id,
    );

    req.user = refreshPayload;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
    });

    return next();
  } catch (err) {
    res.send({
      result: "error",
      message: "서버 접속이 원활하지 않습니다. 다시 로그인 해주세요",
    });
  }
};
