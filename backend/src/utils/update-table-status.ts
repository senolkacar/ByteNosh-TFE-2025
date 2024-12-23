import Table from '../models/table';
import Reservation from '../models/reservation';

const calculateTableStatus = async (tableId: any, reservationDate: any, currentTimeSlot: any) => {

    // Step 1: Check real-time status
    const table = await Table.findById(tableId);

    if (table?.status === 'OCCUPIED' && table.occupiedUntil) {
        const occupiedUntilDate = new Date(table.occupiedUntil).setHours(0, 0, 0, 0);
        const reservationDateObj = new Date(reservationDate).setHours(0, 0, 0, 0);

        // Only return "OCCUPIED" if the reservation date matches the occupiedUntil day
        if (occupiedUntilDate === reservationDateObj) {
            return 'OCCUPIED';
        }
    }

    // Step 2: Check reservations for the current date and time slot
    const reservation = await Reservation.findOne({
        table: tableId,
        reservationTime: {
            $gte: new Date(reservationDate),
            $lt: new Date(new Date(reservationDate).getTime() + 24 * 60 * 60 * 1000), // End of the day
        },
        timeSlot: currentTimeSlot,
        status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    return reservation ? 'RESERVED' : 'AVAILABLE';
};

export default calculateTableStatus;