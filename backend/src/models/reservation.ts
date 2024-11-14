import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservationTime: Date,
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }, // Add section reference
    guests: { type: Number, required: true },
    timeSlot: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED','CHECKED_IN','NO_SHOW'],
        default: 'PENDING'
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    notes: String,
    qrCodeUrl: String,
},
    { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);
