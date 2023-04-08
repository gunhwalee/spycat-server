const jwt = require("jsonwebtoken");
const User = require("../../../models/User");

exports.issueToken = async (req, res, next) => {
  const { id } = req.body;

  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN, {
    expiresIn: "2d",
  });

  try {
    const user = await User.findOneAndUpdate({ id }, { refreshToken });
    const { name, id: loginId } = user;
    const userId = loginId.slice(0, loginId.indexOf("@"));

    res
      .status(201)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .send({
        result: "ok",
        message: "정상적으로 로그인됐습니다.",
        name,
        id: userId,
      });
  } catch (err) {
    return next(err);
  }
};

exports.verifyToken = async (req, res, next) => {
  const cookies = {};
  const cookiesArray = req.headers.cookie.split(";");

  cookiesArray.forEach(cookie => {
    const [key, value] = cookie.trim().split("=");
    cookies[key] = value;
  });

  try {
    const { accessToken, refreshToken } = cookies;

    if (accessToken && refreshToken) {
      const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN);

      if (payload) {
        req.user = payload.id;
        return next();
      }

      const hasRefresh = await User.findOne({ refreshToken });
      if (hasRefresh) {
        const { id } = hasRefresh;
        const newAccessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN, {
          expiresIn: "15m",
        });
        req.user = id;
        res.cookie("accessToken", newAccessToken);

        return next();
      }
    }
  } catch (err) {
    return res.send({
      result: "error",
      message: "서버 접속이 원활하지 않습니다. 다시 로그인 해주세요",
    });
  }
};
