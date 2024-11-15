import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    guests: { type: Number, required: true },
    status: {
        type: String,
        enum: ["WAITING", "NOTIFIED", "SEATED", "CANCELLED"],
        default: "WAITING"
    },
});

export default mongoose.model('Waitlist', waitlistSchema);
