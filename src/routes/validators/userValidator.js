const Joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");

const joipassword = Joi.extend(joiPasswordExtendCore);

const signupSchema = Joi.object().keys({
  id: Joi.string().email().required().trim(),
  pw: joipassword
    .string()
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .min(8)
    .max(16)
    .required(),
  pwCheck: joipassword
    .string()
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .min(8)
    .max(16)
    .required(),
  name: Joi.string().min(2).max(10).required(),
});

exports.signupValidator = (req, res, next) => {
  const validation = signupSchema.validate(req.body);

  if (validation.error) {
    if (validation.error.message.includes("id")) {
      res.send({
        result: "error",
        message: "유효하지 않은 아이디입니다. 규칙을 확인해주세요.",
      });
      return;
    }

    if (validation.error.message.includes("pw")) {
      res.send({
        result: "error",
        message: "유효하지 않은 비밀번호입니다. 규칙을 확인해주세요.",
      });
      return;
    }

    if (validation.error.message.includes("name")) {
      res.send({
        result: "error",
        message: "유효하지 않은 이름입니다. 규칙을 확인해주세요.",
      });
      return;
    }
  }

  next();
};
