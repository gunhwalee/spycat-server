import { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema, serverSchema } from "./joi";

export const signupValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const loginValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const serverInfoValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
