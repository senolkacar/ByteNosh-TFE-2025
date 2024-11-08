import express from "express";
import Closure from "../models/closure";
import {body} from "express-validator";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const closures = await Closure.find();
    res.json(closures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching closures" });
  }
});

router.post("/",
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

router.delete("/",
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

export default router;