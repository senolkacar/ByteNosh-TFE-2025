import express, {Request, Response} from "express";
import {param, validationResult} from "express-validator";
import mongoose from "mongoose";
import Post from "../models/post";
import SiteConfig from "../models/siteconfig";

const router = express.Router();

router.get("/:id",
    param('id').escape().isMongoId().withMessage('Invalid post ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const postId = new mongoose.Types.ObjectId(req.params.id);
            const post = await Post.findById(postId);
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: "Error fetching post" });
        }
    });

export default router;