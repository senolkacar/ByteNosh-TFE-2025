import express,{ Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import Auth from './auth';



const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI;
import userRoutes from './routes/users';
import openingHoursRoutes from './routes/opening-hours';
import closuresRoutes from './routes/closures';
import sectionsRoutes from './routes/sections';
import postsRoutes from './routes/posts';
import mealsRoutes from './routes/meals';
import categoryRoutes from './routes/category';
import tablesRoutes from './routes/tables';
import ordersRoutes from './routes/orders';
import blogRoutes from './routes/blog';
import configRoutes from './routes/config';
import weatherRoutes from './routes/weather';

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/opening-hours', openingHoursRoutes);
app.use('/api/closures', closuresRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/config', configRoutes);
app.use('/api/weather', weatherRoutes);

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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});