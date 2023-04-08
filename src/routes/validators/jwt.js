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

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);

  try {
    await User.findOneAndUpdate({ id }, { refreshToken });
  } catch (err) {
    next(err);
    return;
  }

  res.send({
    result: "ok",
    message: "정상적으로 로그인됐습니다.",
  });
};
