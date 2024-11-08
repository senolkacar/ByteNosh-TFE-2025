import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservationTime: Date,
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    notes: String
});

export default mongoose.model('Reservation', reservationSchema);
