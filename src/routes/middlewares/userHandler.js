const bcrypt = require("bcrypt");
const User = require("../../../models/User");

const checkId = async id => {
  try {
    if (await User.findOne({ id })) return true;
    return false;
  } catch (err) {
    throw Error(500);
  }
};

exports.saveUser = async (req, res, next) => {
  const { id, pw, name } = req.body;

  const hasId = await checkId(id);
  if (hasId) {
    return res.send({
      result: "error",
      message: "중복된 아이디입니다.",
    });
  }

  try {
    const hash = await bcrypt.hash(pw, Number(process.env.SALT));
    const user = new User({ id, pw: hash, name });
    await user.save();
  } catch (err) {
    return next(err);
  }

  next();
};
