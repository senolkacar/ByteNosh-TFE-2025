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
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
});

export default mongoose.model('User', userSchema);