import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import Meal from './meal';
import Table from './table';
import User from './user';
import Order from './order';
import Auth from './auth';
import Category from './category';
import Post from './post';
import SiteConfig from './siteconfig';
import bcrypt from 'bcrypt';
import { sendEmail } from './mailer';

const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI;


app.use(cors());
app.use(express.json());

mongoose.connect(DB_URI as string);

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

app.post('/api/upload', upload.single('image'), (req, res): void => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    res.json({ filename: req.file.filename });
});

app.get('/api/meals', async (req, res): Promise<void> => {
    try {
        const categoryName = req.query.categoryName;
        const meals = await Meal.find(categoryName ? { categoryName } : {});
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
    }
});

app.get('/api/meals/:id', async (req, res): Promise<void> => {
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

app.delete('/api/meals/:id', async (req, res): Promise<void> => {
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

app.post('/api/meals', async (req, res): Promise<void> => {
    const newMeal = req.body;
    try {
        await Meal.create(newMeal);
        res.status(201).json(newMeal);
    } catch (error) {
        res.status(500).json({ message: "Error updating meal" });
    }
});

app.put('/api/meals/:id', async (req, res): Promise<void> => {
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

app.delete('/api/category/:id', async (req, res): Promise<void> => {
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

app.get('/api/categories', async (req, res): Promise<void> => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

app.put('/api/category/:id', async (req, res): Promise<void> => {
    const categoryId = req.params.id;
    const newCategory = req.body;

    try {
        const category = await Category.findById(categoryId);
        if (category) {
            await Category.updateOne({ _id: categoryId }, { $set: newCategory });
            const updatedCategory = await Category.findById(categoryId);
            res.status(200).json(updatedCategory);
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating category" });
    }
});

app.post('/api/categories', async (req, res): Promise<void> => {
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

app.put('/api/categories/:id', async (req, res): Promise<void> => {
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


app.get('/api/tables', async (req, res): Promise<void> => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tables" });
    }
});

app.get('/api/users', async (req, res): Promise<void> => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

app.get('/api/orders', async (req, res): Promise<void> => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});

app.get('/api/posts', async (req, res): Promise<void> => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});

app.get('/api/blog/:id', async (req, res): Promise<void> => {
    try {
        const postId = new mongoose.Types.ObjectId(req.params.id);
        const post = await Post.findById(postId);
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post" });
    }
});

app.get('/api/config', async (req, res): Promise<void> => {
    try {
        const config = await SiteConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: "Error fetching site config" });
    }
});

app.get('/api/user/:email', async (req, res): Promise<void> => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const userWithoutPassword = { ...user.toObject(), password: undefined };
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
});

app.post("/api/send-email", async (req, res): Promise<void> => {
    const { fullname, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

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

app.post("/api/set-config", async (req, res): Promise<void> => {
    const newConfig = req.body;
    try {
        const existingConfig = await SiteConfig.findOne();

        if (existingConfig) {
            await SiteConfig.updateOne({ _id: existingConfig._id }, { $set: newConfig });
            res.status(200).json({ message: "Config updated successfully" });
        } else {
            await SiteConfig.create(newConfig);
            res.status(201).json({ message: "Config created successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to set site config" });
    }
});

app.post("/api/update-user", async (req, res): Promise<void> => {
    const updatedUser = req.body;
    try {
        const user = await User.findOne({ email: updatedUser.email });
        if (user) {
            await User.updateOne({ _id: user._id }, { $set: updatedUser });
            res.status(200).json({ message: "User updated successfully" });
        } else {
            /*
            * Math.random()                        // Generate random number, eg: 0.123456
             .toString(36)           // Convert  to base-36 : "0.4fzyo82mvyr"
                          .slice(-8);// Cut off last 8 characters : "yo82mvyr"
                          * from https://stackoverflow.com/questions/9719570/generate-random-password-string-with-5-letters-and-3-numbers-in-javascript
            * */
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            await User.create(updatedUser);
            await User.updateOne({ email: updatedUser.email }, { $set: { password: hashedPassword } });
            const to = updatedUser.email;
            const subject = "Your temporary password";
            const text = `Your temporary password is: ${tempPassword}, please change it after login`;
            await sendEmail(to, subject, text);
            res.status(201).json({ message: "User created successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});