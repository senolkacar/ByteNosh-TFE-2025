import express, { Request, Response } from "express";
import { sendEmail } from "../utils/mailer";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
    const { fullname, email, message } = req.body;

    try {
        const senderEmail = process.env.DEFAULT_SENDER_EMAIL;
        if (!senderEmail) {
            throw new Error("Default sender email is not defined");
        }
        await sendEmail(
            senderEmail,
            "New message from contact form",
            `Name: ${fullname}\nEmail: ${email}\nMessage: ${message}`,
            `<p>Name: ${fullname}</p><p>Email: ${email}</p><p>Message: ${message}</p>`
        );
        res.json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Error sending message" });
    }
});

export default router;