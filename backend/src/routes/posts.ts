import express, {Request, Response} from "express";
import Post from "../models/post";
import {body, param, validationResult} from "express-validator";
import mongoose from "mongoose";
import {validateRole, validateToken} from "../auth";

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});

router.post(
    "/",
    validateToken,
    validateRole('ADMIN'),
    body('title').trim().escape().isString().isLength({ min: 3 }).withMessage('Title is required'),
    body('body').isString().isLength({ min: 3 }).withMessage('Body is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const newPost = req.body;
        try {
            await Post.create(newPost);
            res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({ message: "Error creating post" });
        }
    });

router.put("/:id",
    validateToken,
    validateRole('ADMIN'),
    param('id').escape().isMongoId().withMessage('Invalid post ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
            return;
        }
        const postId = req.params.id;
        const updatedPost = req.body;
        try {
            const post = await Post.findById(postId);
            if (post) {
                await Post.updateOne({ _id: postId }, { $set: updatedPost });
                res.status(200).json(updatedPost);
            } else {
                res.status(404).json({ message: "Post not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating post" });
        }
    });

router.delete("/:id",
    validateToken,
    validateRole('ADMIN'),
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
            if (!post) {
                res.status(400).json({ message: "Post not found" });
                return;
            }
            await Post.deleteOne({ _id: postId });
            res.json({ message: "Post deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting post" });
        }
    });

export default router;