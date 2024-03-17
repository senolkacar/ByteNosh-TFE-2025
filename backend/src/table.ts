import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    number: Number,
    name: String,
    seats: Number,
    available: Boolean,
});

export default mongoose.model('Table', tableSchema);