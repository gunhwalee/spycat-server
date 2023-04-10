const User = require("../../../models/User");

exports.apiValidator = async (req, res, next) => {
  const apikey = req.params.id;

  try {
    const hasAPI = await User.findOne({ apikey }).populate("servers");

    if (!hasAPI) {
      res.send({
        result: "error",
        message: "인증되지 않은 사용자입니다. API Key를 확인해주세요.",
      });
      return;
    }
  } catch (err) {
    return next(err);
  }
  next();
};
