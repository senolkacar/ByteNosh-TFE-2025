import express from "express";
import Section from "../models/section";
import {body, param, validationResult} from "express-validator";
import mongoose from "mongoose";
import Table from "../models/table";

const router = express.Router();

router.get("/", async (req, res): Promise<void> => {
    try {
        const sections = await Section.find().populate('tables');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections" });
    }
});

router.get("/:name",
    param('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    async (req, res): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const name = decodeURIComponent(req.params?.name);
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
);

router.post("/",
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().escape().isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('tables').isArray().withMessage('Tables is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { name, description, tables } = req.body;

        try {
            let section = await Section.findOne({ name });

            if (section) {
                // Update existing section
                section.description = description;

                const tablePromises = tables.map(async (table:any) => {
                    if (!table._id || !mongoose.Types.ObjectId.isValid(table._id)) {
                        // Create new table
                        const newTable = new Table({ ...table, _id: new mongoose.Types.ObjectId(), section: section?._id });
                        await newTable.save();
                        return newTable;
                    } else {
                        // Update existing table
                        await Table.updateOne({ _id: table._id }, { $set: table });
                        return table;
                    }
                });

                const savedTables = await Promise.all(tablePromises);

                // Only add new table IDs to avoid duplicates
                section.tables = savedTables.map((table) => table._id);

                await section.save();
                res.status(200).json({ section, tables: savedTables });
            } else {
                // Create new section
                section = new Section({ name, description });
                const savedSection = await section.save();

                const tablePromises = tables.map(async (table:any) => {
                    const newTable = new Table({
                        ...table,
                        _id: new mongoose.Types.ObjectId(),
                        section: savedSection._id
                    });
                    await newTable.save();
                    return newTable;
                });

                const savedTables = await Promise.all(tablePromises);

                savedSection.tables = savedTables.map((table) => table._id);
                await savedSection.save();
                res.status(201).json({ section: savedSection, tables: savedTables });
            }
        } catch (error) {
            console.error('Error creating or updating section and tables:', error);
            res.status(500).json({ message: 'Error creating or updating section and tables' });
        }
    }
);

export default router;