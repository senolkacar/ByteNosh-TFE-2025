import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['ADMIN', 'USER', 'EMPLOYEE'],
        default: 'USER'
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

export default mongoose.model('User', userSchema);