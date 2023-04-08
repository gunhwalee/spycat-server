const bcrypt = require("bcrypt");
const User = require("../../../models/User");

const checkId = async id => {
  try {
    const user = await User.findOne({ id });
    if (user) return user;
    return false;
  } catch (err) {
    throw Error(500);
  }
};

exports.saveUserInfo = async (req, res, next) => {
  const { id, pw, name } = req.body;

  try {
    const hasId = await checkId(id);
    if (hasId) {
      return res.send({
        result: "error",
        message: "중복된 아이디입니다.",
      });
    }

    const hash = await bcrypt.hash(pw, Number(process.env.SALT));
    const user = new User({ id, pw: hash, name });
    await user.save();
  } catch (err) {
    return next(err);
  }

  next();
};

exports.loadUserInfo = async (req, res, next) => {
  const { id, pw } = req.body;

  try {
    const user = await checkId(id);

    if (!user) {
      return res.send({
        result: "error",
        message: "등록된 아이디가 없습니다.",
      });
    }

    const match = await bcrypt.compare(pw, user.pw);
    if (!match) {
      return res.send({
        result: "error",
        message: "비밀번호가 올바르지 않습니다.",
      });
    }
  } catch (err) {
    return next(err);
  }

  next();
};
