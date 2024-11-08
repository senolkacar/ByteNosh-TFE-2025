import mongoose from "mongoose";

const closureSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    isClosed: { type: Boolean, default: true },
    reason: String, // e.g., "Holiday" or "Maintenance"
});

export default mongoose.model('Closure', closureSchema);