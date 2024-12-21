import Table from '../models/table';
import Reservation from '../models/reservation';

const calculateTableStatus = async (tableId: any, currentDate: any, currentTimeSlot: any) => {
    const now = new Date();

    // Step 1: Check real-time status
    const table = await Table.findById(tableId);
    if (table?.status === 'OCCUPIED') {
        return 'OCCUPIED';
    }

    // Step 2: Check reservations for the current date and time slot
    const reservation = await Reservation.findOne({
        table: tableId,
        reservationTime: {
            $gte: new Date(currentDate),
            $lt: new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000), // End of the day
        },
        timeSlot: currentTimeSlot,
        status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    return reservation ? 'RESERVED' : 'AVAILABLE';
};

export default calculateTableStatus;