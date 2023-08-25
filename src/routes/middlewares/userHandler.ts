import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../../../models/User";

const checkId = async (id: string) => {
  try {
    const user = await User.findOne({ id });
    if (user) return user;
    return false;
  } catch (err) {
    throw Error("500");
  }
};

export const createUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, pw, name } = req.body;

  try {
    const hasId = await checkId(id);
    if (hasId) {
      return res.send({
        result: "error",
        message: "중복된 아이디입니다.",
      });
    }

    const hash: string = await bcrypt.hash(pw, Number(process.env.SALT));
    await User.create({ id, pw: hash, name });
  } catch (err) {
    return next(err);
  }

  next();
};

export const loadUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, pw } = req.body;

  try {
    const user = await checkId(id);

    if (!user) {
      return res.send({
        result: "error",
        message: "등록된 아이디가 없습니다.",
      });
    }

    const match: boolean = await bcrypt.compare(pw, user.pw);
    if (!match) {
      return res.send({
        result: "error",
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    req.body.user = user._id;
  } catch (err) {
    return next(err);
  }

  next();
};

export const removeRefreshToken = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const obj: { refreshToken: null } = { refreshToken: null };

  try {
    await User.findByIdAndUpdate(id, obj);

    res.clearCookie("accessToken").clearCookie("refreshToken").send({
      result: "ok",
      message: "로그아웃이 정상처리 됐습니다.",
    });
  } catch (err) {
    return next(err);
  }
};
