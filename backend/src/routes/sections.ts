import express, { Request, Response } from "express";
import { param, query, body, validationResult } from "express-validator";
import Section from "../models/section";
import mongoose from "mongoose";
import Table from "../models/table";
import Reservation from "../models/reservation";
import {validateRole, validateToken} from "../auth";
import calculateTableStatus from "../utils/update-table-status";

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
    validateToken,
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
    validateToken,
    validateRole('ADMIN'),
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

                const tablePromises = tables.map(async (table: any) => {
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

                const tablePromises = tables.map(async (table: any) => {
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

router.get("/:sectionId/tables",
    validateToken,
    [
        param("sectionId").isMongoId().withMessage("Invalid section ID"),
        query("reservationDate").isISO8601().withMessage("Invalid date format"),
        query("timeSlot").isString().withMessage("Time slot is required"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { sectionId } = req.params as { sectionId: string };
        const { reservationDate, timeSlot } = req.query as { reservationDate: string, timeSlot: string };

        try {
            const reservationDateObj = new Date(reservationDate);

            const tables = await Table.find({ section: sectionId }).lean();

            const tablesWithStatus = await Promise.all(tables.map(async (table) => {
                const status = await calculateTableStatus(table._id, reservationDateObj, timeSlot);
                return { ...table, status };
            }));

            res.status(200).json(tablesWithStatus);
        } catch (error) {
            console.error("Error fetching tables:", error);
            res.status(500).json({ message: "Error fetching tables", error: (error as Error).message });
        }
    }
);


router.get("/availability/check-availability",
    validateToken,
    [
        query("reservationDate").isISO8601().withMessage("Invalid date format"),
        query("timeSlot").isString().withMessage("Time slot is required"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { reservationDate, timeSlot } = req.query as { reservationDate: string, timeSlot: string };
        const reservationDateObj = new Date(reservationDate);

        try {
            // Step 1: Find all sections
            const sections = await Section.find().lean();

            // Step 2: Iterate through each section and check availability
            let allSectionsFull = true;

            for (const section of sections) {
                // Find all tables in the current section
                const tables = await Table.find({ section: section._id }).lean();

                // Find reservations for the specified date and time slot for the current section
                const reservations = await Reservation.find({
                    table: { $in: tables.map(table => table._id) },
                    reservationTime: {
                        $gte: reservationDateObj,
                        $lt: new Date(reservationDateObj.getTime() + 24 * 60 * 60 * 1000), // End of the day
                    },
                    timeSlot,
                    status: { $in: ["PENDING", "CONFIRMED"] },
                }).lean();

                // Map reservations to table statuses
                const tableStatusMap: Record<string, string> = {};
                reservations.forEach(reservation => {
                    if (reservation.table) {
                        tableStatusMap[reservation.table.toString()] = "RESERVED";
                    }
                });

                // Attach status to each table
                const tablesWithStatus = tables.map(table => ({
                    ...table,
                    status: table._id ? tableStatusMap[table._id.toString()] || 'AVAILABLE' : 'UNKNOWN',
                }));

                // If there is at least one available table, mark allSectionsFull as false
                const sectionIsFull = tablesWithStatus.every(table => table.status === "RESERVED");
                if (!sectionIsFull) {
                    allSectionsFull = false;
                    break; // No need to check further if at least one section is not full
                }
            }

            // Step 3: Return the result
            res.status(200).json({ allSectionsFull });
        } catch (error) {
            console.error("Error checking availability for all sections:", error as any);
            res.status(500).json({ message: "Error checking availability for all sections", error: (error as any).message });
        }
    }
);



export default router;