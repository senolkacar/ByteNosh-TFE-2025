import express, {Request} from "express";
import Order from "../models/order";
import { param, validationResult } from "express-validator";
import {validateToken} from "../auth";
import {UserDocument} from "../models/user";

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

export default router;