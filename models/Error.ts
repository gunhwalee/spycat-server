import { Schema, model, Types } from "mongoose";
import { Server } from "./Server";

interface IError {
  path: string;
  host: string;
  errorName: string;
  errorMessage: string;
  errorStack: string;
  createdAt?: Date;
  expiredAt?: Date;
  server: Types.ObjectId;
}

const errorSchema = new Schema<IError>({
  path: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  errorName: { type: String },
  errorMessage: { type: String, required: true },
  errorStack: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, expires: 1 },
  server: { type: Schema.Types.ObjectId, ref: "Server" },
});

export const ServerError = model<IError>("ServerError", errorSchema);

ServerError.watch().on("change", async (change) => {
  if (change.operationType === "insert") {
    const { _id } = change.documentKey;
    const expiredAt = new Date(Date.now());
    expiredAt.setSeconds(expiredAt.getSeconds() + 60 * 60 * 24 * 28);

    await ServerError.findByIdAndUpdate(_id, {
      expiredAt,
    });
  }

  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});
