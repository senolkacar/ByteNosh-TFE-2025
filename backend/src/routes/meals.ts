import express, {Request, Response} from "express";
import Meal from "../models/meal";
import {body, param, validationResult} from "express-validator";
import mongoose from "mongoose";
import {validateRole, validateToken} from "../auth";

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const meals = await Meal.find().populate('category');
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
    }
});

router.get("/:id",
    param('id').escape().isMongoId().withMessage('Invalid meal ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const mealId = new mongoose.Types.ObjectId(req.params.id);
            const meal = await Meal.findById(mealId);
            if (!meal) {
                res.status(400).json({ message: "Meal not found" });
                return;
            }
            res.json(meal);
        } catch (error) {
            res.status(500).json({ message: "Error fetching meal" });
        }
    });


router.delete("/:id",
    validateToken,
    validateRole("ADMIN"),
    param('id').escape().isMongoId().withMessage('Invalid meal ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const mealId = new mongoose.Types.ObjectId(req.params.id);
            const meal = await Meal.findById(mealId);
            if (!meal) {
                res.status(400).json({ message: "Meal not found" });
                return;
            }
            await Meal.deleteOne({ _id: mealId });
            res.json({ message: "Meal deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting meal" });
        }
    });

router.post("/",
    validateToken,
    validateRole("ADMIN"),
    body('name').trim().escape().isString().isLength({ min: 3 }).withMessage('Name is required'),
    body('price').trim().escape().isNumeric().withMessage('Price is required'),
    body('description').trim().escape().isString().isLength({ min: 3 }).withMessage('Description is required'),
    body('vegetarian').optional().trim().escape().isBoolean().withMessage('Invalid value for vegetarian'),
    body('vegan').optional().trim().escape().isBoolean().withMessage('Invalid value for vegan'),
    body('image').optional().trim().escape().isString().withMessage('Invalid value for image URL'),
    body('category').trim().escape().isString().withMessage('Category is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const mealId = req.params.id;
        const updatedMeal = req.body;

        try {
            const meal = await Meal.findById(mealId);
            if (meal) {
                await Meal.updateOne({ _id: mealId }, { $set: updatedMeal });
                res.status(200).json(meal);
            } else {
                res.status(404).json({ message: "Meal not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating meal" });
        }
    });



export default router;