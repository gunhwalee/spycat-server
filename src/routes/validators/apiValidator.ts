import { NextFunction, Request, Response } from "express";

const { v4: uuidv4 } = require("uuid");
import { Server } from "../../../models/Server";
const User = require("../../../models/User");

export const apiValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { apikey } = req.params;

  try {
    const hasAPI = await Server.findOne({ apikey });

    if (!hasAPI) {
      res.send({
        result: "error",
        message: "API Key를 확인해주세요.",
      });
      return;
    }
  } catch (err) {
    return next(err);
  }

  next();
};

export const regenerateKey = async (req: Request, res: Response, next: NextFunction) => {
  const { apikey } = req.params;
  const newApiKey = uuidv4();

  try {
    await Server.findOneAndUpdate({ apikey }, { apikey: newApiKey });

    const user = await User.findById(req.body.user).populate("servers");
    res.send({
      result: "ok",
      servers: user.servers,
    });
  } catch (err) {
    return next(err);
  }
};
