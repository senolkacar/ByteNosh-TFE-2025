import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
    fullName: string,
    email: string,
    password: string,
    phone: string,
    avatar: string,
    role: string,
    refreshToken?: string; // Current valid refresh token
    refreshTokenExpiresAt?: Date; // Expiry of the current refresh token
    replacedByToken?: string; // Token that replaced the current token (rotation tracking)
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, default: "USER" },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    replacedByToken: { type: String },
});

export default mongoose.model<UserDocument>("User", UserSchema);
