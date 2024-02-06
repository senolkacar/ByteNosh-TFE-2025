// server/src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bytenosh');

// Define routes and other backend logic...

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
