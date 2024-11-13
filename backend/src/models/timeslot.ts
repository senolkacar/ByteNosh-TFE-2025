import mongoose from "mongoose";

const timeslotSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    openHour: String,
    closeHour: String,
    isOpen: Boolean,
});

export default mongoose.model('Timeslot', timeslotSchema);