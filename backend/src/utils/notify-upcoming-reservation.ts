import { sendEmail } from "./mailer";

async function notifyUpcomingReservation(contact: any, message: any) {
    const subject = "Upcoming Reservation at ByteNosh";
    const text = `Hello, you have an upcoming reservation at ByteNosh. We look forward to seeing you soon!`;
    const html = `<p>Hello,</p><p>${message}</p><p>We look forward to seeing you soon!</p>`;

    try {
        await sendEmail(contact, subject, text, html);
        console.log(`Upcoming reservation notification sent to ${contact}`);
    } catch (error) {
        console.error("Error sending reservation notification:", error);
    }
}

export { notifyUpcomingReservation };