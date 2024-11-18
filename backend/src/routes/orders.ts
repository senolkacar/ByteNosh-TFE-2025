import express from "express";
import Order from "../models/order";
import { param, validationResult } from "express-validator";

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
    '/:userId',
    param('userId').isMongoId().withMessage('Invalid user ID'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { userId } = req.params as Record<string, any>;

        try {
            const lastReservation = await Order.findOne({ user: userId }).sort({ reservationTime: -1 });
            if (!lastReservation) {
                res.status(404).json({ message: 'No reservations found for this user' });
                return;
            }
            const populatedLastReservation = await lastReservation.populate("meals");
            const totalSum = populatedLastReservation.meals.reduce((sum:any, meal: any) => sum + meal.price, 0);
            res.json({ totalSum });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching last reservation' });
        }
    }
);

router.get('/getOne/:id',
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

export default router;