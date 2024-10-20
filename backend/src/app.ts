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
import SiteConfig from "./siteconfig";

const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(DB_URI as string);

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

app.get('/api/config', async (req, res) => {
    try {
        const config = await SiteConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({message: "Error fetching site config"});
    }
});

app.get('/api/user/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.json(user);
    }catch (error) {
        res.status(500).json({message: "Error fetching user"});
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

app.post("/api/set-config", async (req, res) => {
    const newConfig = req.body;
    try {
        // Get the existing site config
        const existingConfig = await SiteConfig.findOne();

        // If config exists, update it
        if (existingConfig) {
            await SiteConfig.updateOne({}, { $set: newConfig });
            res.status(201).json({ message: "Site config updated successfully" });
        } else {
            // If no config exists, create a new one
            await SiteConfig.create(newConfig);
            res.status(201).json({ message: "Site config created successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to set site config" });
    }
});

app.post("/api/update-user", async (req, res) => {
    const updatedUser = req.body;
    try {
        const user = await User.findOne({ email: updatedUser.email });
        if (user) {
            // Update only the specified fields (like role) in the user
            await User.updateOne(
                { email: updatedUser.email }, // filter by email
                { $set: updatedUser }         // update with the new data
            );
            res.status(201).json({ message: "User updated successfully" });
        } else {
            await User.create(updatedUser);
            res.status(201).json({ message: "User created successfully" });
        }
    } catch (e) {
        res.status(500).json({ message: "Error updating user" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
