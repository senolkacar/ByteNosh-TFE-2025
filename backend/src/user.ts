import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: String,
    fullName: String,
    email: String,
    phone: String,
    avatar: String,
    password: String,
    role: {
        type: String,
        enum: ['ADMIN', 'USER', 'EMPLOYEE'],
        default: 'USER'
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

export default mongoose.model('User', userSchema);