import { subHours, isWithinInterval } from 'date-fns';
import Reservation from '../models/reservation';
import User from '../models/user';
import { notifyUpcomingReservation } from './notify-upcoming-reservation';

const notifyUpcomingReservations = async () => {
    try {
        const now = new Date();
        const threeHoursLater = subHours(now, -3);

        // Find all reservations within the next 3 hours that haven't been notified yet
        const upcomingReservations = await Reservation.find({
            reservationTime: {
                $gte: now,
                $lt: threeHoursLater
            },
            status: "CONFIRMED",
            notified: false
        });

        for (const reservation of upcomingReservations) {
            if (!reservation.reservationTime) continue;

            if (isWithinInterval(new Date(reservation.reservationTime), { start: now, end: threeHoursLater })) {
                // Notify the customer about the upcoming reservation
                const user = await User.findById(reservation.user);

                if (!user) continue;

                await notifyUpcomingReservation(user.email, `Reminder: Your reservation is scheduled for ${new Date(reservation.reservationTime).toLocaleTimeString()}!`);
                console.log(`Notified ${reservation._id} for upcoming reservation`);

                // Update the reservation to set notified to true
                reservation.notified = true;
                await reservation.save();
            }
        }
    } catch (error) {
        console.error("Cron job failed:", error);
    }
};

// Example usage with node-cron
import nodeCron from 'node-cron';

// Schedule the function to run every 10 minutes
nodeCron.schedule('*/10 * * * *', notifyUpcomingReservations);