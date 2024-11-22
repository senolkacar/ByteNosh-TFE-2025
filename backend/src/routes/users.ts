import express, {Request, Response} from 'express';
import {body, param, validationResult} from 'express-validator';
import User, {UserDocument} from '../models/user';
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import {sendEmail} from "../utils/mailer";
import {validateRole, validateToken} from "../auth";

const router = express.Router();

interface CustomRequest extends Request {
    user?: UserDocument;
}

router.get('/',
    validateToken,
    validateRole('ADMIN'),
    async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

router.get('/:email',
    validateToken,
    param('email').escape().isEmail().withMessage('Invalid email'),
    async (req :CustomRequest, res:Response): Promise<void> => {
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
            if (req.user?.id.toString() !== user.id.toString()) {
                res.status(403).json({ message: "You are not authorized to access this data" });
                return;
            }
            const userWithoutPassword = { ...user.toObject(), password: undefined };
            res.json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user" });
        }
});

router.put('/updateProfile',
    body('fullName').trim().escape().isString().isLength({ min: 1 }).withMessage('Full name is required'),
    body('email').trim().escape().isEmail().withMessage('Invalid email'),
    body('phone').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid phone number'),
    body('avatar').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid avatar URL'),
    async (req :CustomRequest, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const updatedUser = req.body;
        const userId = req.user?.id;
        try {
            const user = await User.findById(userId);
            if (user) {
                if(updatedUser.email !== user.email) {
                    const existingUser = await User.findOne({ email: updatedUser.email });
                    if (existingUser) {
                        res.status(400).json({ message: "This email is already taken." });
                        return;
                    }
                }
            }
            await User.updateOne({ _id: userId }, { $set: updatedUser });
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: "Error updating user" });
        }
    });

router.put('/changePassword',
    validateToken,
    body('password').trim().escape().isString().isLength({ min: 6 }).withMessage('Password is required'),
    async (req :CustomRequest, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const userId = req.params.id;
        const newPassword = req.body.password;
        try {
            const user = await User.findById(userId);
            if (req.user?.id.toString() !== userId) {
                res.status(403).json({ message: "You are not authorized to update this password" });
                return;
            }
            if (user) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
                res.status(200).json({ message: "Password updated successfully" });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating password" });
        }
    });

router.delete('/:id',
    validateToken,
    validateRole('ADMIN'),
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

router.post('/',
    validateToken,
    validateRole('ADMIN'),
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
                await User.updateOne({ _id: user.id }, { $set: updatedUser });
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
                const html = `<p>Your temporary password is: <strong>${tempPassword}</strong>, please change it after login</p>`;
                await sendEmail(to, subject, text, html);
                res.status(201).json({ message: "User created successfully" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating user" });
        }
    });

export default router;