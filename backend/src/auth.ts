import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './models/user';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
const router = express.Router();
const JWT_SECRET = process.env.AUTH_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

// Register a new user
router.post(
    '/register',
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'User already exists' });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 8);
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
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user || !user.password) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
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
    async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ message: 'User not found' });
                return;
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user' });
        }
    }
);

router.get(
    '/getUserById',
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        try {
            const user = await User.findById(id);
            if (!user) {
                res.status(400).json({ message: 'User not found' });
                return;
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user' });
        }
    }
);

export default router;