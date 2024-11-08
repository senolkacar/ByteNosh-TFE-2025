import express from "express";
import Post from "../models/post";

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});


export default router;