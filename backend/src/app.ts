// server/src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Meal from "./meal";
import Table from "./table";
import User from "./user";
import Order from "./order";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bytenosh');

// Define routes and other backend logic...
app.get('/api/meals', async (req, res) => {
    try {
        const meals = await Meal.find(); // Fetch all meals from the database
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
