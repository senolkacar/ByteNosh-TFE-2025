import { sendEmail } from "./mailer";

async function notifyCustomer(contact: any, message: any) {
    const subject = "Table Now Available at ByteNosh";
    const text = `Hello, a table is now available for you at ByteNosh. Please check in as soon as possible to secure it.`;
    const html = `<p>Hello,</p><p>${message}</p><p>Please check in as soon as possible to secure it.</p>`;

    try {
        await sendEmail(contact, subject, text, html);
        console.log(`Waitlist notification sent to ${contact}`);
    } catch (error) {
        console.error("Error sending waitlist notification:", error);
    }
}

export { notifyCustomer };
