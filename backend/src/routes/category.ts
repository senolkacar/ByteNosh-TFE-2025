import express, {Request, Response} from "express";
import Category from "../models/category";
import {body, param, validationResult} from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

router.delete("/:id",
    param('id').escape().isMongoId().withMessage('Invalid category ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const categoryId = new mongoose.Types.ObjectId(req.params.id);
            const category = await Category.findById(categoryId);
            if (!category) {
                res.status(400).json({ message: "Category not found" });
                return;
            }
            await Category.deleteOne({ _id: categoryId });
            res.json({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting category" });
        }
});

router.put("/:id",
    body('name').trim().escape().isString().isLength({ min: 3 }).withMessage('Name is required'),
    body('description').trim().escape().isString().isLength({ min: 3 }).withMessage('Description is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const newCategory = req.body;
        try {
            const category = await Category.findById(newCategory._id);
            if (category) {
                if(newCategory.find((cat: any) => cat.name === newCategory.name && cat._id !== newCategory._id)) {
                    res.status(400).json({ message: "Category name must be unique" });
                    return;
                }
                await Category.updateOne({ _id: newCategory._id }, { $set: newCategory });
                res.status(201).json({ message: "Category updated successfully" });
            } else {
                if(newCategory.find((cat: any) => cat.name === newCategory.name)) {
                    res.status(400).json({ message: "Category name must be unique" });
                    return;
                }
                await Category.create(newCategory);
                res.status(201).json({ message: "Category created successfully" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating category" });
        }
    });

router.post("/",
    body('name').trim().escape().isString().isLength({ min: 3 }).withMessage('Name is required'),
    body('description').trim().escape().isString().isLength({ min: 3 }).withMessage('Description is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const newCategory = req.body;
        try {
            const category = await Category.findById(newCategory._id);
            if (category) {
                const existingCategory = await Category.findOne({ name: newCategory.name && newCategory._id !== category._id });
                if (existingCategory) {
                    res.status(400).json({ message: "Category name must be unique" });
                    return;
                }
                await Category.updateOne({ _id: newCategory._id }, { $set: newCategory });
                res.status(201).json(category);
            } else {
                const existingCategory = await Category.findOne({ name: newCategory.name });
                if (existingCategory) {
                    res.status(400).json({ message: "Category name must be unique" });
                    return;
                }
                const createdCategory = await Category.create(newCategory);
                res.status(201).json(createdCategory);
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating category" });
        }
});



export default router;