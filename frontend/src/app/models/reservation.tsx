export default interface Reservation {
    _id: string;
    table: string;
    user: string;
    reservationTime: Date;
    section: string;
    guests: number;
    timeSlot: string;
    status: string;
    orders: string[];
    createdAt: Date;
    updatedAt: Date;
    notes: string;
    qrCodeUrl: String,
}