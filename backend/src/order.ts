import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
    date: Date,
    status: String,
});

export default mongoose.model('Order', orderSchema);
