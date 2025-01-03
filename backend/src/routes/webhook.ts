import bodyParser from "body-parser";
import express, {Request, Response} from "express";
import Stripe from "stripe";
import Order from "../models/order";
import {getSocketIO} from "../utils/socket";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-12-18.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

router.post(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }),
    async (req: Request, res: Response): Promise<void> => {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event | undefined;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        if (!event) {
            res.status(400).send('Event not found');
            return;
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    console.log('Checkout session completed:', session);

                    // Update the order to PAID
                    const paymentIdentifier = session.metadata?.paymentIdentifier;
                    const order = await Order.findOneAndUpdate(
                        { paymentIdentifier },
                        { paymentStatus: 'PAID' },
                        { new: true }
                    );

                    const io = getSocketIO();
                    io.emit('payment-status-updated', {
                        paymentIdentifier,
                        paymentStatus: 'PAID',
                    });

                    if (!order) {
                        console.error(`Order with PaymentIntent ID ${paymentIdentifier} not found.`);
                    } else {
                        console.log('Order payment status updated to PAID:', order);
                    }
                    break;
                }

                case 'payment_intent.succeeded': {
                    const paymentIdentifier = event.data.object.metadata.paymentIdentifier;
                    console.log('Payment succeeded:', paymentIdentifier);

                    // Update the order to PAID
                    const order = await Order.findOneAndUpdate(
                        { paymentIdentifier: paymentIdentifier },
                        { paymentStatus: 'PAID' },
                        { new: true }
                    );

                    const io = getSocketIO();
                    io.emit('payment-status-updated', {
                        paymentIdentifier,
                        paymentStatus: 'PAID',
                    });

                    if (!order) {
                        console.error(`Order with PaymentIntent ID ${paymentIdentifier} not found.`);
                    } else {
                        console.log('Order payment status updated to PAID:', order);
                    }
                    break;
                }

                case 'payment_intent.payment_failed': {
                    const paymentIdentifier = event.data.object.metadata.paymentIdentifier;
                    console.log('Payment failed:', paymentIdentifier);

                    // Update the order to FAILED
                    const order = await Order.findOneAndUpdate(
                        { paymentIdentifier: paymentIdentifier},
                        { paymentStatus: 'FAILED' },
                        { new: true }
                    );

                    const io = getSocketIO();
                    io.emit('payment-status-updated', {
                        paymentIdentifier,
                        paymentStatus: 'FAILED',
                    });

                    if (!order) {
                        console.error(`Order with PaymentIntent ID ${paymentIdentifier} not found.`);
                    } else {
                        console.log('Order payment status updated to FAILED:', order);
                    }
                    break;
                }

                case 'checkout.session.async_payment_succeeded':
                case 'checkout.session.async_payment_failed':
                case 'checkout.session.expired':
                case 'charge.succeeded':
                case 'charge.failed':

                    const io = getSocketIO();
                    io.emit('payment-status-update', event);

                    console.log(`Event ${event.type} received. Handle as needed.`);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            // Acknowledge the event
            res.json({ received: true });
        } catch (err: any) {
            console.error('Error processing webhook event:', err.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

export default router;