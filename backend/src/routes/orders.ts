import express from "express";
import Order from "../models/order";
import Meal from "../models/meal";

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

export default router;