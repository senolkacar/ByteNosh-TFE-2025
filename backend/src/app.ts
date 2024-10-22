// server/src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import Meal from "./meal";
import Table from "./table";
import User from "./user";
import Order from "./order";
import Auth from "./auth";
import Category from "./category";
import Post from "./post";
import SiteConfig from "./siteconfig";
import meal from "./meal";

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Send the filename back as a response
    res.json({ filename: req.file.filename });
});

app.get('/api/meals', async (req, res) => {
    try {
       const categoryName = req.query.categoryName;
               const meals = await Meal.find(categoryName ? { categoryName } : {});
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
    }
});

app.get('/api/meals/:id', async (req, res) => {
    try {
        const mealId = new mongoose.Types.ObjectId(req.params.id);
        const meal = await Meal.findById(mealId);
        if (!meal) {
            return res.status(400).json({ message: "Meal not found" });
        }
        res.json(meal);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meal" });
    }
});

app.delete('/api/meals/:id', async (req, res) => {
    try{
        const mealId = new mongoose.Types.ObjectId(req.params.id);
        const meal = await Meal.findById(mealId);
        if(!meal){
            return res.status(400).json({message: "Meal not found"});
        }
        await Meal.deleteOne({_id: mealId});
        res.json({message: "Meal deleted successfully"});
    }catch (error){
        res.status(500).json({message: "Error deleting meal"});
    }
});

app.post('/api/meals', async (req, res) => {
    const newMeal = req.body;
    try {
        await Meal.create(newMeal);
        res.status(201).json(newMeal);
    }catch(error){
        res.status(500).json({message: "Error updating meal"});
    }
});
app.put('/api/meals/:id', async (req, res) => {
    const mealId = req.params.id; // Get category ID from URL
    const updatedMeal = req.body; // Get updated category data from request body

    try {
        const meal = await Meal.findById(mealId); // Find category by ID
        if (meal) {
            // Update meal
            await Meal.updateOne(
                { _id: mealId },
                { $set: updatedMeal }
            );
            res.status(200).json(meal);
        } else {
            // If no meal is found, return an error
            res.status(404).json({ message: "Meal not found" });
        }
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({ message: "Error updating meal" });
    }
});

app.delete('/api/category/:id', async (req, res) => {
    try{
        const categoryId = new mongoose.Types.ObjectId(req.params.id);
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(400).json({message: "Category not found"});
        }
        await Category.deleteOne({_id: categoryId});
        res.json({message: "Category deleted successfully"});
    }catch (error){
        res.status(500).json({message: "Error deleting category"});
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

app.put('/api/category/:id', async (req, res) => {
    const categoryId = req.params.id; // Get category ID from URL
    const newCategory = req.body; // Get updated category data from request body

    try {
        const category = await Category.findById(categoryId); // Find category by ID
        if (category) {
            // Update category
            await Category.updateOne(
                { _id: categoryId },
                { $set: newCategory }
            );
            const updatedCategory= await Category.findById(categoryId);
            res.status(200).json(updatedCategory);
        } else {
            // If no category is found, return an error
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({ message: "Error updating category" });
    }
});
app.post('/api/categories', async (req, res) => {
    const newCategory = req.body;
    try {
        const category = await Category.findById(newCategory._id);
        if (category) {
            await Category.updateOne(
                { _id: newCategory._id },
                { $set: newCategory }
            );
            res.status(201).json(category);
        } else {
            const createdCategory = await Category.create(newCategory);
            res.status(201).json(createdCategory);
        }
    }catch(error){
        res.status(500).json({message: "Error updating category"});
    }
});
app.put('/api/categories/:id', async (req, res) => {
    const newCategory = req.body;
    try {
        const category = await Category.findById(newCategory._id);
        if (category) {
            await Category.updateOne(
                { _id: newCategory._id },
                { $set: newCategory }
            );
            res.status(201).json({ message: "Category updated successfully" });
        } else {
            await Category.create(newCategory);
            res.status(201).json({ message: "Category created successfully" });
        }
    }catch(error){
        res.status(500).json({message: "Error updating category"});
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
