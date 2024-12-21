import express, {NextFunction, Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User, { UserDocument, RefreshToken } from './models/user';
import dotenv from 'dotenv';
import crypto from "crypto";

dotenv.config({ path: './.env' });
const router = express.Router();
const JWT_SECRET = process.env.AUTH_SECRET!;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

interface CustomRequest extends Request {
    user?: UserDocument;
}

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" }); // Short-lived token
};

export const generateEmployeeAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' }); // Long-lived token
}

export const generateRefreshToken = (): { token: string; expiresAt: Date } => {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    return { token, expiresAt };
};

// Register a new user
router.post(
    '/register',
    body('email').isEmail(),
    body('fullName').isString(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { fullName, email, password, confirmPassword } = req.body;

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
            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                role: 'USER',
                refreshTokens: [],
            });
            await newUser.save();
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user' });
        }
    }
);

// Login a user
router.post(
    "/login",
    body("email").isEmail(),
    body("password").exists(),
    async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
            if ((user.role !== "EMPLOYEE" && user.role !== "ADMIN") && req.body.appType === "employeeApp") {
                res.status(403).json({ message: "Unauthorized for this app" });
                return;
            }

            // Generate tokens
            const accessToken = user.role === 'EMPLOYEE' ? generateEmployeeAccessToken(user.id) : generateAccessToken(user.id);
            const refreshToken = generateRefreshToken();

            user.refreshTokens.push(refreshToken);
            await user.save();

            res.status(200).json({ user, accessToken, refreshToken: refreshToken.token });
        } catch (error) {
            res.status(500).json({ message: "Error logging in" });
        }
    }
);

router.get('/validate', async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error validating token' });
    }
});

export const validateToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({ message: 'Invalid token. User does not exist.' });
            return;
        }

        req.user = user; // Attach the user to the request object for later use
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export const validateRole = (role: string) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user || user.role !== role) {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};

router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // Check if refresh token is provided
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }

    try {
        // Find the user and check for valid refresh tokens
        const user = await User.findOne({
            refreshTokens: { $elemMatch: { token: refreshToken, expiresAt: { $gt: new Date() } } },
        });

        if (!user) {
            res.status(403).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        const newRefreshToken = generateRefreshToken();

        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        const newAccessToken = generateAccessToken(user.id);

        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken.token });
    } catch (error) {
        res.status(500).json({ message: 'Error refreshing token' });
    }
});

router.post(
    "/logout",
    async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token is required" });
            return;
        }

        try {
            const user = await User.findOne({
                refreshTokens: { $elemMatch: { token: refreshToken } },
            });

            if (user) {
                user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
                await user.save();
            }
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error logging out" });
        }
    }
);




export default router;
