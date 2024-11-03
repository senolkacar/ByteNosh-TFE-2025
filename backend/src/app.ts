import express,{ Request, Response } from 'express';
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
import Timeslot from './timeslot';
import bcrypt from 'bcrypt';
import { sendEmail } from './mailer';
import {query, validationResult, matchedData, Result, param, body} from 'express-validator';
import category from "./category";
import Closure from "./closure";
import Section from "./section";


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

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({ storage,fileFilter });

app.post('/api/upload', upload.single('image'), (req, res): void => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    res.json({ filename: req.file.filename });
});

app.get('/api/opening-hours', async (req, res): Promise<void> => {
    try {
        const openingHours = await Timeslot.find();
        res.json(openingHours);
    } catch (error) {
        res.status(500).json({ message: "Error fetching opening hours" });
    }
});

app.post('/api/opening-hours',
    body('day').trim().escape().isString().isLength({ min: 1 }).withMessage('Day is required'),
    body('openHour').isDate().withMessage('Invalid open hour'),
    body('closeHour').isDate().withMessage('Invalid close hour'),
    body('isOpen').isBoolean().withMessage('Invalid value for isOpen'),
    async (req, res): Promise<void> => {
    const newHours = req.body;
    try {
        await Timeslot.deleteMany({});
        await Timeslot.insertMany(newHours);
        res.status(201).json(newHours);
    } catch (error) {
        res.status(500).json({ message: "Error updating opening hours" });
    }
});

app.put('/api/opening-hours',
    body('day').trim().escape().isString().isLength({ min: 1 }).withMessage('Day is required'),
    body('openHour').isDate().withMessage('Invalid open hour'),
    body('closeHour').isDate().withMessage('Invalid close hour'),
    body('isOpen').isBoolean().withMessage('Invalid value for isOpen'),
    async (req, res): Promise<void> => {
    const updatedHours = req.body;
    try {
        await Timeslot.deleteMany({});
        await Timeslot.insertMany(updatedHours);
        res.status(200).json(updatedHours);
    } catch (error) {
        res.status(500).json({ message: "Error updating opening hours" });
    }
});

app.get('/api/closures', async (req, res): Promise<void> => {
    try {
        const closures = await Closure.find();
        res.json(closures);
    } catch (error) {
        res.status(500).json({ message: "Error fetching closures" });
    }
});

app.post('/api/closures',
    body('date').trim().escape().isDate().withMessage('Invalid date'),
    body('reason').optional().trim().escape().isString().withMessage('Invalid value for reason'),
    async (req, res): Promise<void> => {
    const newClosure = req.body;
    try {
        await Closure.deleteOne(newClosure);
        await Closure.insertMany(newClosure);
        res.status(201).json(newClosure);
    } catch (error) {
        res.status(500).json({ message: "Error updating closures" });
    }
});

app.delete('/api/closures',
    body('date').trim().escape().isDate().withMessage('Invalid date'),
    async (req, res): Promise<void> => {
    const newClosures = req.body;
    const isDateFound = await Closure.findOne({ date: newClosures.date });
    if(!isDateFound) {
        try {
            await Closure.deleteOne(newClosures);
            res.status(200).json({message: "Closures deleted successfully"});
        } catch (error) {
            res.status(500).json({message: "Error deleting closures"});
        }
    }else{
        res.status(400).json({message: "Date not found"});
    }
});

app.get('/api/sections',
    async (req, res): Promise<void> => {
    try {
        const sections = await Section.find().populate('tables');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections" });
    }
});

app.get(
    '/api/sections/:name',
    param('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

            const name = req.params?.name;
            try {
                const section = await Section.findOne({ name }).populate('tables');
                if (!section) {
                    res.status(404).json({ message: "Section not found" });
                    return;
                }
                res.json(section);
            } catch (error) {
                res.status(500).json({ message: "Error fetching section" });
            }
        }
)

app.post(
    '/api/sections',
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().escape().isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('tables').isArray().withMessage('Tables is required'),
    async (req, res):Promise<void> => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }

        const { name, description, tables } = req.body;

        try {
            const section = new Section({ name, description });
            const savedSection = await section.save();
            const tablePromises = tables.map((table: any) =>
                Table.create({
                    ...table,
                    section: savedSection._id,
                })
            );
            const savedTables = await Promise.all(tablePromises);

            savedSection.tables = savedTables.map((table) => table._id);
            await savedSection.save();
            res.status(201).json({ section: savedSection, tables: savedTables });
        } catch (error) {
            res.status(500).json({ message: 'Error creating section and tables'});
        }
    }
);


app.get('/api/posts', async (req, res): Promise<void> => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});

app.post(
    '/api/posts',
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

app.put(
    '/api/posts/:id',
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

app.delete(
    '/api/posts/:id',
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

app.get('/api/meals', async (req, res): Promise<void> => {
    try {
        const meals = await Meal.find().populate('category');
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meals" });
    }
});

app.get(
    '/api/meals/:id',
    param('id').escape().isMongoId().withMessage('Invalid meal ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
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

app.delete(
    '/api/meals/:id',
    param('id').escape().isMongoId().withMessage('Invalid meal ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
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

app.post(
    '/api/meals',
    body('name').trim().escape().isString().isLength({ min: 3 }).withMessage('Name is required'),
    body('price').trim().escape().isNumeric().withMessage('Price is required'),
    body('description').trim().escape().isString().isLength({ min: 3 }).withMessage('Description is required'),
    body('vegetarian').optional().trim().escape().isBoolean().withMessage('Invalid value for vegetarian'),
    body('vegan').optional().trim().escape().isBoolean().withMessage('Invalid value for vegan'),
    body('image').optional().trim().escape().isString().withMessage('Invalid value for image URL'),
    body('category').trim().escape().isString().withMessage('Category is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
    const newMeal = req.body;
    try {
        await Meal.create(newMeal);
        res.status(201).json(newMeal);
    } catch (error) {
        res.status(500).json({ message: "Error updating meal" });
    }
});

app.put(
    '/api/meals',
    body('name').trim().escape().isString().isLength({ min: 3 }).withMessage('Name is required'),
    body('price').trim().escape().isNumeric().withMessage('Price is required'),
    body('description').trim().escape().isString().isLength({ min: 3 }).withMessage('Description is required'),
    body('vegetarian').optional().trim().escape().isBoolean().withMessage('Invalid value for vegetarian'),
    body('vegan').optional().trim().escape().isBoolean().withMessage('Invalid value for vegan'),
    body('image').optional().trim().escape().isString().withMessage('Invalid value for image URL'),
    body('category').trim().escape().isString().withMessage('Category is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

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

app.delete(
    '/api/category/:id',
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


app.get('/api/categories', async (req, res): Promise<void> => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

app.put(
    '/api/category/:id',
    param('id').escape().isMongoId().withMessage('Invalid category ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
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

app.post(
    '/api/categories',
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

app.put(
    '/api/categories/:id',
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

app.get(
    '/api/blog/:id',
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

app.get('/api/config', async (req, res): Promise<void> => {
    try {
        const config = await SiteConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: "Error fetching site config" });
    }
});

app.get(
    '/api/user/:email',
    param('email').escape().isEmail().withMessage('Invalid email'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
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

app.post(
    "/api/set-config",
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('slogan').trim().escape().isString().isLength({ min: 1 }).withMessage('Slogan is required'),
    body('about').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about'),
    body('popularDishes.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for popular dishes title'),
    body('popularDishes.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for popular dishes description'),
    body('mobile.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile title'),
    body('mobile.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile description'),
    body('mobile.googlePlay').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile google play'),
    body('mobile.appStore').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile app store'),
    body('social.facebook').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social facebook'),
    body('social.twitter').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social twitter'),
    body('social.instagram').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social instagram'),
    body('contact.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact title'),
    body('contact.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact description'),
    body('contact.telephone').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact telephone'),
    body('contact.email').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact email'),
    body('contact.address').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact address'),
    body('contact.latitude').optional().trim().escape().isNumeric().withMessage('Invalid value for contact latitude'),
    body('contact.longitude').optional().trim().escape().isNumeric().withMessage('Invalid value for contact longitude'),
    body('aboutUs.title1').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us title1'),
    body('aboutUs.description1').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us description1'),
    body('aboutUs.title2').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us title2'),
    body('aboutUs.description2').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us description2'),

    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
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

app.delete(
    "/api/delete-user/:id",
    param('id').escape().isMongoId().withMessage('Invalid user ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (user) {
            await User.deleteOne({ _id: userId });
            res.status(200).json({ message: "User deleted successfully" });
        }else{
            res.status(404).json({ message: "User not found" });
        }
    }catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
    });

app.post(
    "/api/update-user",
    body('fullName').trim().escape().isString().isLength({ min: 3 }).withMessage('Full name is required'),
    body('email').trim().escape().isEmail().withMessage('Invalid email'),
    body('phone').optional().trim().escape().isString(),
    body('role').trim().escape().isString().withMessage('Role is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
    const updatedUser = req.body;
    try {
        const userId = new mongoose.Types.ObjectId(updatedUser.id);
        const user = await User.findById(userId);
        if(updatedUser.id && user){
                const mailBelongsToAnotherUser = await User.findOne({ email: updatedUser.email, _id: { $ne: updatedUser.id } });
                if (mailBelongsToAnotherUser) {
                    res.status(400).json({ message: "Email already in use" });
                    return;
                }
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