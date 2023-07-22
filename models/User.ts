import { Schema, model } from "mongoose";

interface IUser {
  id: string,
  pw: string,
  name: string,
  servers: string[],
  refreshToken?: string
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, trim: true },
  pw: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  servers: [{ type: Schema.Types.ObjectId, ref: "Server" }],
  refreshToken: { type: String },
});

export const User = model<IUser>("User", userSchema);
