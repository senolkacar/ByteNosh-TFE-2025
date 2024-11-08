import express, {Request, Response} from 'express';
import {body, param, validationResult} from 'express-validator';
import Timeslot from "../models/timeslot";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const openingHours = await Timeslot.find();
        res.json(openingHours);
    } catch (error) {
        res.status(500).json({ message: "Error fetching opening hours" });
    }
});

router.post('/',
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

router.put('/',
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

export default router;