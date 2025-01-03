import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    meals: [{
        meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
        quantity: { type: Number, required: true }
    }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    date: Date,
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'SERVED', 'PAID', 'CANCELLED','ARCHIVED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['AWAITING_PAYMENT', 'PAID', 'EXPIRED', 'REFUNDED', 'FAILED'],
        default: 'AWAITING_PAYMENT'
    },
    paymentIntentId: { type: String, required: false },
    paymentIdentifier: { type: String, required: false },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    createdAt: { type: Date, default: Date.now },
    notes: String
});

export default mongoose.model('Order', orderSchema);
