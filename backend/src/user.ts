import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

export default mongoose.model('User', userSchema);