import express, {Request, Response} from 'express';
import {body, param, validationResult} from 'express-validator';
import Timeslot from "../models/timeslot";
import { parseISO, getDay } from 'date-fns';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> =>  {
    const { date } = req.query;

    if (date) {
        try {
            // Parse the date and get the day of the week (0 = Sunday, 6 = Saturday)
            const parsedDate = parseISO(date as string);
            const dayOfWeek = getDay(parsedDate);

            // Map day of the week number to string format used in your Timeslot model
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = days[dayOfWeek];

            // Find opening hours for that day
            const openingHours = await Timeslot.findOne({ day: dayName });
            if (!openingHours) {
                res.status(404).json({ message: "No opening hours found for this day" });
            }
            res.json(openingHours);
        } catch (error) {
            res.status(500).json({ message: "Error fetching opening hours", error });
        }
    } else {
        // If no date query, return all opening hours
        try {
            const openingHours = await Timeslot.find();
            res.json(openingHours);
        } catch (error) {
            res.status(500).json({ message: "Error fetching opening hours" });
        }
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