import express, {Request} from "express";
import Order from "../models/order";
import { param, validationResult } from "express-validator";
import {validateToken} from "../auth";
import {UserDocument} from "../models/user";
import Table from "../models/table";
import Reservation from "../models/reservation";

interface CustomRequest extends Request {
    user?: UserDocument;
}

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const posts = await Order.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order" });
    }
});

router.get("/most-ordered", async (req, res): Promise<void> => {
    try {
        const mostOrderedItems = await Order.aggregate([
            { $unwind: "$meals" },
            { $group: { _id: "$meals", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "meals",
                    localField: "_id",
                    foreignField: "_id",
                    as: "meal",
                },
            },
            { $unwind: "$meal" },
            {
                $project: {
                    _id: "$meal._id",
                    name: "$meal.name",
                    price: "$meal.price",
                    image: "$meal.image",
                    count: 1,
                },
            },
        ]);
        res.json(mostOrderedItems);
    } catch (error) {
        res.status(500).json({ message: "Error fetching most ordered items" });
    }
});

router.get(
    '/getUserLastOrder',
    validateToken,
    async (req: CustomRequest, res): Promise<void> => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const userId = req.user?.id;

        try {
            const lastOrder = await Order.findOne({ user: userId }).sort({ reservationTime: -1 });
            if (!userId || !lastOrder || !lastOrder.user || lastOrder.user.toString() !== userId.toString()) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
            if (!lastOrder) {
                res.status(404).json({ message: 'No orders found for this user' });
                return;
            }
            const populatedLastOrder = await lastOrder.populate("meals");
            const totalSum = populatedLastOrder.meals.reduce((sum: any, meal: any) => sum + meal.price, 0);
            res.json({ totalSum });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching last order' });
        }
    }
);

router.get('/getOne/:id',
    validateToken,
    param('id').isMongoId().withMessage('Invalid order ID'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params as Record<string, any>;

        try {
            const order = await Order.findById(id).populate('meals', 'name description price');
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order' });
        }
    }
);

router.get('/table/:id',
    validateToken,
    param('id').isMongoId().withMessage('Invalid table ID'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params as Record<string, any>;

        try {
            const activeStatuses = ['PENDING', 'IN_PROGRESS','SERVED'];
            const orders = await Order.find({ table: id, status: { $in: activeStatuses } })
                .populate('meals.meal', 'name description price');

            if (!orders || orders.length === 0) {
                res.status(404).json({ message: 'No active orders found' });
                return;
            }

            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders' });
        }
    }
);

router.get('/payment-status',
    async (req, res): Promise<void> => {
        const { paymentIntentId } = req.query as Record<string, any>;

        if(!paymentIntentId){
            res.status(400).json({ message: 'Payment intent ID is required' });
            return;
        }

        try {
            const order = await Order.findOne({ paymentIntentId });
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json({
                orderId: order._id,
                paymentIntentId: order.paymentIntentId,
                paymentStatus: order.paymentStatus,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching payment status' });
        }


    }
    )



router.delete("/:id",
    validateToken,
    param('id').isMongoId().withMessage('Invalid order ID'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params as Record<string, any>;

        try {
            const order = await Order.findById(id);
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            await Order.deleteOne({ _id: id });
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting order' });
        }
    }
);

router.post("/",
    validateToken,
    async (req, res): Promise<void> => {
        const { table, meals, notes } = req.body;
        if (!table || !meals || meals.length === 0) {
            res.status(400).json({ error: 'Table and meals are required' });
            return;
        }

        try {
            const tableDoc = await Table.findById(table);
            if (!tableDoc) {
                res.status(404).json({ message: 'Table not found' });
                return;
            }

            let user = null;
            let reservation = null;

           if (tableDoc.status === 'RESERVED') {
            reservation = await Reservation.findOne({ table: tableDoc._id, status: 'CONFIRMED' }).populate('user');
            if (reservation) {
                const currentDate = new Date();
                const reservationDate = reservation.reservationTime;
                const [startHour, endHour] = reservation.timeSlot.split('-').map(time => parseInt(time, 10));
                const currentHour = currentDate.getHours();

                if (reservationDate && reservationDate.toDateString() === currentDate.toDateString() && currentHour >= startHour && currentHour < endHour) {
                    user = reservation.user;
                }else{
                    reservation = null;
                }
            }}

            const order = new Order({
                table: table,
                meals: meals.map((meal: any) => ({ meal: meal.meal, quantity: meal.quantity })),
                user: user ? user._id : null,
                reservation: reservation ? reservation._id : null,
                notes: notes || '',
            });

            await order.save();
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error creating order', error });
        }
    }
);

    router.put("/:id",
        validateToken,
        param('id').isMongoId().withMessage('Invalid order ID'),
        async (req, res): Promise<void> => {
            const { table, meals, notes } = req.body;
            const { id } = req.params as Record<string, any>;

            if (!table || !meals || meals.length === 0) {
                res.status(400).json({ error: 'Table and meals are required' });
                return;
            }

            try {
                const order = await Order.findById(id);
                if (!order) {
                    res.status(404).json({ message: 'Order not found' });
                    return;
                }

                const tableDoc = await Table.findById(table);
                if (!tableDoc) {
                    res.status(404).json({ message: 'Table not found' });
                    return;
                }

                let user = null;
                let reservation = null;

                if (tableDoc.status === 'RESERVED') {
                    reservation = await Reservation.findOne({ table: tableDoc._id, status: 'CONFIRMED' }).populate('user');
                    if (reservation) {
                        const currentDate = new Date();
                        const reservationDate = reservation.reservationTime;
                        const [startHour, endHour] = reservation.timeSlot.split('-').map(time => parseInt(time, 10));
                        const currentHour = currentDate.getHours();

                        if (reservationDate && reservationDate.toDateString() === currentDate.toDateString() && currentHour >= startHour && currentHour < endHour) {
                            user = reservation.user;
                        } else {
                            reservation = null;
                        }
                    }
                }

                order.table = table;
                order.meals = meals.map((meal: any) => ({ meal: meal.meal, quantity: meal.quantity }));
                order.user = user ? user._id : null;
                order.reservation = reservation ? reservation._id : null as any;
                order.notes = notes || '';
                await order.save();
                res.json(order);
            } catch (error) {
                res.status(500).json({ message: 'Error updating order', error });
            }
        }
    );

    router.patch("/:id",
        validateToken,
        param('id').isMongoId().withMessage('Invalid order ID'),
        async (req, res): Promise<void> => {
            const { status } = req.body;
            const { id } = req.params as Record<string, any>;

            try {
                const order = await Order.findById(id);
                if (!order) {
                    res.status(404).json({ message: 'Order not found' });
                    return;
                }

                order.status = status;
                await order.save();
                res.json(order);
            } catch (error) {
                res.status(500).json({ message: 'Error updating order', error });
            }
        }
    );


export default router;