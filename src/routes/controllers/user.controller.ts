import { NextFunction, Request, Response } from "express";

export const signupEndpoint = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send({
    result: "ok",
    message: "회원가입이 정상처리됐습니다.",
  });
};
