import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservationTime: Date,
    status: String,
});

export default mongoose.model('Reservation', reservationSchema);
