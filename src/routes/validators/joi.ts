import Joi from "joi";

const passwordSchema = Joi
  .string()
  .min(8)
  .max(16)
  .trim()
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
