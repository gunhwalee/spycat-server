import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../../models/User";

interface JwtPayload {
  id: string
}

interface Tokens {
  accessToken: string,
  refreshToken: string
}

export const issueToken = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken: string = jwt.sign({ id: req.body.user }, process.env.ACCESS_TOKEN, {
    expiresIn: "30m",
  });

  const refreshToken: string = jwt.sign({ id: req.body.user }, process.env.REFRESH_TOKEN, {
    expiresIn: "1d",
  });

  try {
    const user = await User.findByIdAndUpdate(req.body.user, { refreshToken });
    const { name, id } = user;

    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .send({
        result: "ok",
        message: "정상적으로 로그인됐습니다.",
        name,
        _id: req.body.user,
        id,
      });
  } catch (err) {
    return next(err);
  }
};

const accessTokenVerify = (token: string) => {
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN) as JwtPayload;
    return decode.id;
  } catch (err) {
    if (err.name === "TokenExpiredError") return null;
  }
};

const refreshTokenVerify = async (token: string, id: string) => {
  try {
    const user = await User.findOne({ apikey: id });

    if (token === user.refreshToken) {
      jwt.verify(token, process.env.REFRESH_TOKEN);
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: "30m",
        },
      );

      return { newAccessToken, refreshPayload: user._id };
    }
  } catch (err) {
    throw Error("500");
  }
};

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken, refreshToken }: Tokens = req.cookies;

  try {
    if (accessToken && refreshToken) {
      const payload = accessTokenVerify(accessToken);

      if (payload) {
        req.body.user = payload;
        return next();
      }
    }

    const { newAccessToken, refreshPayload } = await refreshTokenVerify(
      refreshToken,
      req.params.id,
    );

    req.body.user = refreshPayload;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
    });

    return next();
  } catch (err) {
    res.send({
      result: "error",
      message: "서버 접속이 원활하지 않습니다. 다시 로그인 해주세요",
    });
  }
};
