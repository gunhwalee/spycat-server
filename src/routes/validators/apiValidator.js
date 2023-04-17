const { v4: uuidv4 } = require("uuid");
const User = require("../../../models/User");

exports.apiValidator = async (req, res, next) => {
  const apikey = req.params.id;

  try {
    const hasAPI = await User.findOne({ apikey });

    if (!hasAPI) {
      res.send({
        result: "error",
        message: "API Key를 확인해주세요.",
      });
      return;
    }
  } catch (err) {
    return next(err);
  }

  req.user = apikey;
  next();
};
