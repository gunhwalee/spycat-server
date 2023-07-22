import Joi, { ExtensionFactory } from "joi";

const joiPasswordExtension: ExtensionFactory = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "password.minOfLowercase": "{{#label}} must have at least {{#limit}} lowercase character(s)",
    "password.minOfUppercase": "{{#label}} must have at least {{#limit}} uppercase character(s)",
    "password.minOfNumeric": "{{#label}} must have at least {{#limit}} numeric character(s)",
    "password.noWhiteSpaces": "{{#label}} cannot have whitespace characters",
  },
  rules: {
    minOfLowercase: {
      validate(value, helpers, args, options) {
        if ((value.match(/[a-z]/g) || []).length >= args.limit) {
          return value;
        }
        return helpers.error("password.minOfLowercase", { limit: args.limit });
      },
    },
    minOfUppercase: {
      validate(value, helpers, args, options) {
        if ((value.match(/[A-Z]/g) || []).length >= args.limit) {
          return value;
        }
        return helpers.error("password.minOfUppercase", { limit: args.limit });
      },
    },
    minOfNumeric: {
      validate(value, helpers, args, options) {
        if ((value.match(/[0-9]/g) || []).length >= args.limit) {
          return value;
        }
        return helpers.error("password.minOfNumeric", { limit: args.limit });
      },
    },
    noWhiteSpaces: {
      validate(value, helpers, args, options) {
        if (!/\s/.test(value)) {
          return value;
        }
        return helpers.error("password.noWhiteSpaces");
      },
    },
  },
});

const joi = Joi.extend(joiPasswordExtension)

const passwordSchema = joi
  .string()
  .min(8)
  .max(16)
  .minOfLowercase(1)
  .minOfUppercase(1)
  .minOfNumeric(1)
  .noWhiteSpaces()
  .required();

export const signupSchema = Joi.object().keys({
  name: Joi.string().min(1).max(10).required(),
  id: Joi.string().email().required().trim(),
  pw: passwordSchema,
  pwCheck: passwordSchema
});

export const loginSchema = Joi.object().keys({
  id: Joi.string().email().required().trim(),
  pw: passwordSchema
});

export const serverSchema = Joi.object().keys({
  serverName: Joi.string().required(),
  url: Joi.string().trim().required(),
});
