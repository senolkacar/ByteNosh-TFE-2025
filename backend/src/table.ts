import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    number: Number,
    name: String,
    seats: Number,
    isAvailable: Boolean,
});

export default mongoose.model('Table', tableSchema);