import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Reservation from "../models/reservation";
import admin from "firebase-admin";
import QRCode from "qrcode";
import encryptData  from "../utils/qr-code";
import { sendEmail } from "../utils/mailer";
import User from "../models/user";

const router = express.Router();

async function generateEncryptedQRCode(reservation: any) {
    const data = {
        reservationId: reservation._id.toString(),
        userId: reservation.user.toString(),
        reservationTime: reservation.reservationTime,
    };
    const encryptionKey = process.env.QR_ENCRYPTION_KEY;
    if(!encryptionKey) {
        throw new Error("QR_ENCRYPTION_KEY is not defined");
    }
    const encryptedData = encryptData(data, encryptionKey);
    return await QRCode.toDataURL(encryptedData);
}

async function saveReservationToFirestore(reservation: any) {
    const db = admin.firestore();
    const reservationRef = db.collection("reservations").doc(reservation._id.toString());

    try {
        await reservationRef.set({
            table: reservation.table ? reservation.table.toString() : null,
            section: reservation.section ? reservation.section.toString() : null,
            guests: reservation.guests ?? null,
            reservationTime: reservation.reservationTime ?? null,
            timeSlot: reservation.timeSlot ?? null,
            user: reservation.user ? reservation.user.toString() : null,
            status: reservation.status ?? null,
        });
    } catch (error) {
        console.error("Error saving reservation to Firestore:", error);
        throw error;
    }
}

router.post(
    "/",
    [
        body("tableId").isMongoId().withMessage("Invalid table ID"),
        body("sectionId").isMongoId().withMessage("Invalid section ID"),
        body("guests").isInt({ min: 1, max: 6 }).withMessage("Guests must be between 1 and 6"),
        body("reservationDate").isISO8601().withMessage("Invalid reservation date"),
        body("timeSlot").isString().withMessage("Invalid time slot"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { tableId, sectionId, guests, reservationDate, timeSlot, userId } = req.body;

        try {
            const existingReservation = await Reservation.findOne({
                table: tableId,
                reservationTime: new Date(reservationDate),
                timeSlot,
                status: { $in: ["PENDING", "CONFIRMED"] },
            });

            if (existingReservation) {
                res.status(409).json({ message: "Table is already reserved for this time slot." });
                return;
            }

            const newReservation = new Reservation({
                table: tableId,
                section: sectionId,
                guests,
                reservationTime: new Date(reservationDate),
                timeSlot,
                user: userId,
                status: "PENDING",
            });

            const savedReservation = await newReservation.save();

            const qrCodeUrl = await generateEncryptedQRCode(savedReservation);
            savedReservation.qrCodeUrl = qrCodeUrl;
            savedReservation.status = "CONFIRMED";
            await savedReservation.save();
            await saveReservationToFirestore(savedReservation);

            const reservationDateObj = new Date(reservationDate);

            const emailSubject = "Your Reservation Confirmation";
            const emailText = `Your reservation is confirmed for ${timeSlot} on ${reservationDateObj.toLocaleDateString("en-GB")}. Please find the QR code below.`;
            const emailHtml = `
            <h3>Your Reservation Confirmation</h3>
            <p>Dear Customer,</p>
            <p>Your reservation is confirmed for <strong>${timeSlot}</strong> on <strong>${reservationDateObj.toLocaleDateString("en-GB")}</strong>.</p>
            <p>Below is your reservation QR code:</p>
            <img src="cid:qrcode" alt="QR Code" />
            <p>Thank you for choosing our service!</p>
        `;


            const user = await User.findById(userId);
            if (!user?.email) {
                throw new Error("User email is not defined");
            }
            await sendEmail(
                user?.email,
                emailSubject,
                emailText,
                emailHtml,
                [
                    {
                        filename: 'qrcode.png',
                        path: qrCodeUrl,
                        cid: 'qrcode'
                    }
                ]
            );

            const message = {
                notification: {
                    title: "New Reservation",
                    body: `Reservation for ${timeSlot} at table ${tableId} has been made.`,
                },
                topic: "reservations",
            };

            await admin.messaging().send(message);

            res.status(201).json({ reservation: savedReservation, qrCodeUrl });
        } catch (error: any) {
            console.error("Error saving reservation:", error);
            res.status(500).json({ message: "Error saving reservation", error: error.message });
        }
    }
);

export default router;
