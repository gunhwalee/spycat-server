import { Schema, model, Types } from "mongoose";
import { Server } from "./Server";

interface ITraffic {
  path: string;
  host: string;
  createdAt?: Date;
  expiredAt?: Date;
  server: Types.ObjectId;
}

const trafficSchema = new Schema<ITraffic>({
  path: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, expires: 1 },
  server: { type: Schema.Types.ObjectId, ref: "Server" },
});

export const Traffic = model<ITraffic>("Traffic", trafficSchema);

Traffic.watch().on("change", async (change) => {
  if (change.operationType === "insert") {
    const { _id } = change.documentKey;
    const expiredAt = new Date(Date.now());
    expiredAt.setSeconds(expiredAt.getSeconds() + 60 * 60 * 24 * 28);

    await Traffic.findByIdAndUpdate(_id, {
      expiredAt,
    });
  }

  if (change.operationType === "delete") {
    const { _id } = change.documentKey;
    await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } });
  }
});
