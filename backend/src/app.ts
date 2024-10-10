// server/src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Meal from "./meal";
import Table from "./table";
import User from "./user";
import Order from "./order";
import Auth from "./auth";
import Category from "./category";
import Post from "./post";

const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bytenosh');

// Define routes and other backend logic...
app.use('/api/auth', Auth);

app.use('/images', express.static(path.join(__dirname, '..', 'images')));

app.get('/api/meals', async (req, res) => {
    try {
       const categoryName = req.query.categoryName;
               const meals = await Meal.find(categoryName ? { categoryName } : {});
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
    }
});

app.get('/api/categories',async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({message: "Error fetching categories"});
    }
});

app.get('/api/tables', async (req, res) => {
    try{
        const tables = await Table.find();
    res.json(tables);
} catch (error) {
    res.status(500).json({ message: "Error fetching tables" });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({message: "Error fetching users"});
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({message: "Error fetching orders"});
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({message: "Error fetching posts"});
    }
});

app.get('/api/blog/:id', async (req, res) => {
    try {
        const postId = new mongoose.Types.ObjectId(req.params.id);
        const post = await Post.findById(postId);
        res.json(post);
    } catch (error) {
        res.status(500).json({message: "Error fetching post"});
    }
});

app.post("/api/send-email", async (req, res) => {
    const { fullname, email, message } = req.body;

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Configure the email options
    const mailOptions = {
        from: email,
        to: "recipient-email@example.com",
        subject: `Message from ${fullname}`,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send("Email sent successfully");
    } catch (error) {
        res.status(500).send("Failed to send email");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
