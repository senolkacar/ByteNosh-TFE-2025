import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { validateToken } from "../auth";
import Stripe from "stripe";
import dotenv from "dotenv";
import QRCode from "qrcode";
import Order from "../models/order";
import Meal from "../models/meal";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-12-18.acacia",
});

router.post(
    "/generate-payment-qr/:tableId",
    [
        validateToken,
        param("tableId").isMongoId().withMessage("Invalid table ID"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { tableId } = req.params;

        try {
            const activeStatuses = ["PENDING", "IN_PROGRESS", "SERVED"];
            const orders = await Order.find({ table: tableId, status: { $in: activeStatuses },paymentStatus: "AWAITING_PAYMENT" }).populate("meals.meal", "price name");

            if (!orders || orders.length === 0) {
                res.status(404).json({ message: "No active orders found" });
                return;
            }

            // Calculate total amount and gather meal details
            let totalAmount = 0;
            const mealDetails: string[] = [];

            for (const order of orders) {
                for (const mealItem of order.meals) {
                    const meal = await Meal.findById(mealItem.meal);
                    if (meal && meal.price) {
                        totalAmount += meal.price * mealItem.quantity;
                        mealDetails.push(`${meal.name} x${mealItem.quantity}`);
                    }
                }
            }

            const paymentIdentifier = uuidv4();

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Use Math.round to ensure the amount is an integer
                currency: "eur",
                metadata: {
                    tableId: tableId,
                    mealDetails: mealDetails.join(", "),
                    paymentIdentifier: paymentIdentifier,
                },
            });

            orders.map(async (order) => {
                order.paymentIntentId = paymentIntent.id;
                order.paymentIdentifier = paymentIdentifier;
                await order.save();
            });

            const price = await stripe.prices.create({
                unit_amount: Math.round(totalAmount * 100), // Use Math.round to ensure the amount is an integer
                currency: "eur",
                product_data: {
                    name: "Table Order Payment",
                    metadata: {
                        tableId: tableId,
                        mealDetails: mealDetails.join(", "),
                        paymentIdentifier: paymentIdentifier,
                    },
                },
            });

            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price: price.id,
                        quantity: 1,
                    },
                ],
                metadata: {
                    tableId: tableId,
                    mealDetails: mealDetails.join(", "),
                    paymentIdentifier: paymentIdentifier,
                },
            });

            const qrCode = await QRCode.toDataURL(paymentLink.url);

            res.json({
                url: paymentLink.url,
                qrCode,
                totalAmount,
                paymentIdentifier: paymentIdentifier,
            });
        } catch (error: any) {
            console.error("Error generating payment QR code:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/status/:paymentId',
    async (req: Request, res: Response): Promise<void> => {
        const { paymentId } = req.params;

        try {
            const payment = await stripe.paymentIntents.retrieve(paymentId);
            res.json({ status: payment.status });
        } catch (error: any) {
            console.error("Error fetching payment status:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);





export default router;