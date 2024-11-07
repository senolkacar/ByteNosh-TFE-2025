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
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

export default mongoose.model('Reservation', reservationSchema);
