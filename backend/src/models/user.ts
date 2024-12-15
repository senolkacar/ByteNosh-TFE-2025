import mongoose, { Schema, Document } from "mongoose";

export interface RefreshToken {
    token: string;
    expiresAt: Date;
}

export interface UserDocument extends Document {
    fullName: string,
    email: string,
    password: string,
    phone: string,
    avatar: string,
    role: string,
    refreshTokens: RefreshToken[];
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, default: "USER" },
    refreshTokens: [
        {
            token: { type: String, required: true },
            expiresAt: { type: Date, required: true },
        },
    ],
});

export default mongoose.model<UserDocument>("User", UserSchema);
