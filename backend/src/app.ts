import express,{ Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import Auth from './auth';
import admin from 'firebase-admin';
import serviceAccount from "../firebase/bytenosh-d27b2-firebase-adminsdk-02pq6-c1f0941ea8.json";


import { createServer } from "http";
import {initializeSocket} from "./utils/socket";
const app = express();
const path = require('path');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
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
import reservationRoutes from './routes/reservations';
import contactRoutes from './routes/contact';
import waitlistRoutes from "./routes/waitlist";
import "../src/utils/cron";
import "../src/utils/upcoming-reservation-job";


app.use(cors({
    origin: ['https://senolkacar.be'], // Allow requests from your domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true,
}));
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
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/waitlist', waitlistRoutes);


mongoose.connect(DB_URI as string);

app.use('/api/auth-backend', Auth);
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use('/sounds', express.static(path.join(__dirname, '..', 'sounds')));


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

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

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});