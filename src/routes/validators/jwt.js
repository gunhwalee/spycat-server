const jwt = require("jsonwebtoken");
const User = require("../../../models/User");

exports.issueToken = async (req, res, next) => {
  const accessToken = jwt.sign({ id: req.user }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: req.user }, process.env.REFRESH_TOKEN, {
    expiresIn: "1d",
  });

  try {
    const user = await User.findByIdAndUpdate(req.user, { refreshToken });
    const { name } = user;

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
        id: req.user,
      });
  } catch (err) {
    return next(err);
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

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
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
        });

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
