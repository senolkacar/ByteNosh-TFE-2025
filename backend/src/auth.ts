import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './user';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});
const router = express.Router();
const JWT_SECRET = process.env.AUTH_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

// Register a new user
router.post(
    '/register',
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, email, password: hashedPassword, role: 'USER' });
            await newUser.save();

            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user' });
        }
    }
);

// Login a user
router.post(
    '/login',
    body('email').isEmail(),
    body('password').exists(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user || !user.password) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Password is incorrect' });
            }

            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ user, token });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in' });
        }
    }
);

// Return the user with the provided mail else return null
router.get(
    '/getUserByMail',
    async (req: Request, res: Response) => {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user' });
        }
    }
);
router.get(
    'getUserById',
    async (req: Request, res: Response) => {
        const { id } = req.body;

        try {
            const user = await User.findOne({ id });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({message: 'Error fetching user'});
        }
    }
);

export default router;
