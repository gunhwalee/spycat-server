import { Schema, model } from "mongoose";

interface  IServer {
  serverName: string,
  url: string,
  traffics: string[],
  errorLists: string[],
  apikey: string
}

const serverSchema = new Schema<IServer>({
  serverName: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true, unique: true },
  traffics: [{ type: Schema.Types.ObjectId, ref: "Traffic" }],
  errorLists: [{ type: Schema.Types.ObjectId, ref: "ServerError" }],
  apikey: { type: String, require: true, unique: true },
})

export const Server = model<IServer>("Server", serverSchema);
