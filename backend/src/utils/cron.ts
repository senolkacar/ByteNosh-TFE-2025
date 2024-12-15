import cron from "node-cron";
import Waitlist from "../models/waitlist";
import Table from "../models/table";
import { notifyCustomer } from "./notify-customer";
import Reservation from "../models/reservation";

cron.schedule("*/5 * * * *", async () => {
    try {
        // Find all waitlist entries with status "WAITING"
        const waitlistEntries = await Waitlist.find({ status: "WAITING" });

        for (const waitlistEntry of waitlistEntries) {
            const { reservationDate, timeSlot, guests } = waitlistEntry;

            // Step 1: Find all available tables for the given date and timeslot
            const reservations = await Reservation.find({
                reservationTime: {
                    $gte: reservationDate ? new Date(reservationDate) : new Date(),
                    $lt: reservationDate ? new Date(new Date(reservationDate).getTime() + 24 * 60 * 60 * 1000) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // End of the day
                },
                timeSlot,
                status: { $in: ["PENDING", "CONFIRMED"] },
            });

            const reservedTableIds = reservations.map((reservation) => reservation.table);

            // Step 2: Determine the table size based on the number of guests
            let tableQuery: any = { _id: { $nin: reservedTableIds }, status: "AVAILABLE" };

            if (guests < 2) {
                tableQuery.seats = 2;
            } else if (guests >= 2 && guests < 4) {
                tableQuery.seats = { $in: [2, 4] };
            } else if (guests >= 4) {
                tableQuery.seats = { $in: [4, 6] };
            }

            const availableTable = await Table.findOne(tableQuery);

            // Step 3: If an available table is found, update waitlist status and notify the user
            if (availableTable) {
                // Update waitlist entry status to "NOTIFIED"
                await Waitlist.findByIdAndUpdate(waitlistEntry._id, { status: "NOTIFIED" });

                // Notify the customer about the available table
                await notifyCustomer(waitlistEntry.contact, `A table is now available for your preferred time slot on ${reservationDate}!`);
                console.log(`Notified ${waitlistEntry.name} for available table`);
            }
        }
    } catch (error) {
        console.error("Cron job failed:", error);
    }
});