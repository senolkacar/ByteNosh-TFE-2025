import cron from "node-cron";
import Reservation from "../models/reservation";
import { subHours, isWithinInterval } from 'date-fns';
import User from "../models/user";
import {notifyUpcomingReservation} from "./notify-upcoming-reservation";

cron.schedule("*/10 * * * *", async () => { // scheduling at every 10 minutes for demo purposes
    try {
        const now = new Date();
        const threeHoursLater = subHours(now, -3);

        // Find all reservations within the next 3 hours
        const upcomingReservations = await Reservation.find({
            reservationTime: {
                $gte: now,
                $lt: threeHoursLater
            },
            status: "CONFIRMED"
        });

        for (const reservation of upcomingReservations) {
            if (!reservation.reservationTime) continue;
            if (isWithinInterval(new Date(reservation.reservationTime), { start: now, end: threeHoursLater })) {
                // Notify the customer about the upcoming reservation
                const user = await User.findById(reservation.user);
                if (!user) continue;
                await notifyUpcomingReservation(user.email, `Reminder: Your reservation is scheduled for ${new Date(reservation.reservationTime).toLocaleTimeString()}!`);
                console.log(`Notified ${reservation._id} for upcoming reservation`);
            }
        }
    } catch (error) {
        console.error("Cron job failed:", error);
    }
});