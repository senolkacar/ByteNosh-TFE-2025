import express from "express";
import  Waitlist from "../models/waitlist";
import { getSocketIO } from "../utils/socket";
import {validateRole, validateToken} from "../auth";

const router = express.Router();

router.post("/",
    validateToken,
    async (req, res) => {
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

        res.status(201).json(newWaitlistEntry);
    } catch (error) {
        console.error("Error adding to waitlist:", error);
        res.status(500).json({ message: "Failed to add to waitlist" });
    }
});

router.get("/",
    validateToken,
    validateRole('ADMIN'),
    async (req, res) => {
    try {
        const waitlistEntries = await Waitlist.find();
        res.status(200).json(waitlistEntries);
    } catch (error) {
        console.error("Error fetching waitlist entries:", error);
        res.status(500).json({ message: "Error fetching waitlist entries" });
    }
});

export default router;