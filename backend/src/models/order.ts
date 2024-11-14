import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    date: Date,
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'SERVED', 'PAID', 'CANCELLED'],
        default: 'PENDING'
    },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    createdAt: { type: Date, default: Date.now },
    notes: String
});

export default mongoose.model('Order', orderSchema);
