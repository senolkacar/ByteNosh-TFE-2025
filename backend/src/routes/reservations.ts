import express, { Request, Response } from "express";
import {body, param, validationResult} from "express-validator";
import Reservation from "../models/reservation";
import admin from "firebase-admin";
import QRCode from "qrcode";
import encryptData from "../utils/qr-code";
import { sendEmail } from "../utils/mailer";
import User, {UserDocument} from "../models/user";
import { getSocketIO } from "../utils/socket";
import {validateToken} from "../auth";

interface CustomRequest extends Request {
    user?: UserDocument;
}

const router = express.Router();



async function generateEncryptedQRCode(reservation: any) {
    const data = {
        reservationId: reservation._id.toString(),
        userId: reservation.user.toString(),
        reservationTime: reservation.reservationTime,
    };
    const encryptionKey = process.env.QR_ENCRYPTION_KEY;
    if (!encryptionKey) {
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
            isRead: false,
            createdAt: reservation.createdAt?.toISOString(),
            updatedAt: reservation.updatedAt?.toISOString()
        });
    } catch (error) {
        console.error("Error saving reservation to Firestore:", error);
        throw error;
    }
}

router.post(
    "/",
    validateToken,
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
                isRead: false
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

router.get('/last',
    validateToken,
    async (req: CustomRequest, res: Response): Promise<void> => {
        const user = req.user;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const reservation = await Reservation.findOne({ user: user.id }).sort({ createdAt: -1 });
            if (!reservation) {
                res.status(404).json({ message: "Reservation not found" });
                return;
            }

            res.json({ reservation });
        } catch (error) {
            console.error("Error fetching reservation:", error);
            res.status(500).json({ message: "Error fetching reservation" });
        }
    }
);

router.get('/all',
    validateToken,
    async (req: CustomRequest, res: Response): Promise<void> => {
        const user = req.user;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const reservations = await Reservation.find({ user: user.id })
                .populate("table", "name")
                .populate("section", "name");

            res.json({ reservations });
        } catch (error) {
            console.error("Error fetching reservations:", error);
            res.status(500).json({ message: "Error fetching reservations" });
        }
    }
)

router.get("/:id",
    validateToken,
    param("id").isMongoId().withMessage("Invalid reservation ID"),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;

        try {
            const reservation = await Reservation.findById(id);
            if (!reservation) {
                res.status(404).json({ message: "Reservation not found" });
                return;
            }
            await reservation.populate("user", "fullName");
            await reservation.populate("table", "name");
            await reservation.populate("section", "name");
            res.json({ reservation });
        } catch (error) {
            console.error("Error fetching reservation:", error);
            res.status(500).json({ message: "Error fetching reservation" });
        }
    }
);


router.put("/:id/cancel",
    validateToken,
    param("id").isMongoId().withMessage("Invalid reservation ID"),
    async (req: CustomRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;

        try {
            const reservation = await Reservation.findById(id);
            if (!reservation) {
                res.status(404).json({ message: "Reservation not found" });
                return;
            }

            if (req.user?.role !== 'ADMIN' && reservation.user?.toString() !== req.user?.id?.toString()) {
                res.status(403).json({ message: "You are not authorized to cancel this reservation" });
                return;
            }

            reservation.status = "CANCELLED";
            await reservation.save();

            const firestore = admin.firestore();
            const firestoreRef = firestore.collection('reservations').doc(id);
            await firestoreRef.update({ status: "CANCELLED" });


            const reservationDateObj = new Date(reservation.reservationTime as unknown as string);

            const emailSubject = "Your Reservation Has Been Cancelled";
            const emailText = `Dear User,\n\nYour reservation for ${reservation.timeSlot} on ${reservationDateObj.toLocaleDateString("en-GB")} has been cancelled.\n\nThank you!`;
            const emailHtml = `<p>Dear User,</p><p>Your reservation for <strong>${reservation.timeSlot}</strong> on <strong>${reservationDateObj.toLocaleDateString("en-GB")}</strong> </p> has been cancelled.</p><p>Thank you!</p>`;

            const user = await User.findById(reservation.user);
            if (!user?.email) {
                throw new Error("User email is not defined");
            }
            await sendEmail(
                user.email,
                emailSubject,
                emailText,
                emailHtml,
            );
            const message = {
                notification: {
                    title: "Reservation Cancelled",
                    body: `Reservation for ${reservation.timeSlot} has been cancelled.`,
                },
                topic: "reservations",
            };

            await admin.messaging().send(message);

            const io = getSocketIO();
            io.emit("table-available", { tableId: reservation.table, timeSlot: reservation.timeSlot });
            res.json({ reservation });
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            res.status(500).json({ message: "Error cancelling reservation" });
        }
    }
);



export default router;