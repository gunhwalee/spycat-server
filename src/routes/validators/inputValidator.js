const Joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");

const joipassword = Joi.extend(joiPasswordExtendCore);

const signupSchema = Joi.object().keys({
  name: Joi.string().min(1).max(10).required(),
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
});

const loginSchema = Joi.object().keys({
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
});

const serverSchema = Joi.object().keys({
  serverName: Joi.string().required(),
  url: Joi.string().trim().required(),
});

exports.signupValidator = (req, res, next) => {
  const validation = signupSchema.validate(req.body);

  if (validation.error) {
    if (validation.error.message.includes("name")) {
      res.send({
        result: "error",
        message: "유효하지 않은 이름입니다. 규칙을 확인해주세요.",
      });
      return;
    }

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
  }

  next();
};

exports.loginValidator = (req, res, next) => {
  const validation = loginSchema.validate(req.body);

  if (validation.error) {
    if (validation.error.message.includes("id")) {
      res.send({
        result: "error",
        message: "유효하지 않은 아이디입니다.",
      });
      return;
    }

    if (validation.error.message.includes("pw")) {
      res.send({
        result: "error",
        message: "유효하지 않은 비밀번호입니다.",
      });
      return;
    }
  }

  next();
};

exports.serverInfoValidator = (req, res, next) => {
  const validation = serverSchema.validate(req.body);

  if (validation.error) {
    if (validation.error.message.includes("serverName")) {
      res.send({
        result: "error",
        message: "유효하지 않은 서버이름입니다.",
      });
      return;
    }

    if (validation.error.message.includes("url")) {
      res.send({
        result: "error",
        message: "유효하지 않은 서버주소입니다.",
      });
      return;
    }
  }

  next();
};
