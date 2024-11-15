import express from "express";
import  Waitlist from "../models/waitlist";
import { getSocketIO } from "../utils/socket";

const router = express.Router();

router.post("/", async (req, res) => {
    const { name, contact, guests, reservationDate, timeSlot } = req.body;

    try {
        const newWaitlistEntry = await Waitlist.create({
            name,
            contact,
            guests,
            reservationDate: new Date(reservationDate),
            timeSlot,
        });

        // Notify staff in real-time via WebSocket
        const io = getSocketIO();
        io.emit("waitlist-update", { message: "New waitlist entry added", entry: newWaitlistEntry });

        res.status(201).json({ message: "Successfully added to waitlist" });
    } catch (error) {
        console.error("Error adding to waitlist:", error);
        res.status(500).json({ message: "Failed to add to waitlist" });
    }
});

export default router;