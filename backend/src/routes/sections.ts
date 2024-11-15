import express, { Request, Response } from "express";
import { param, query, body, validationResult } from "express-validator";
import Section from "../models/section";
import mongoose from "mongoose";
import Table from "../models/table";
import Reservation from "../models/reservation";

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

            // Step 1: Find all tables in the specified section
            const tables = await Table.find({ section: sectionId }).lean();

            // Step 2: Find reservations for the specified date and time slot
            const reservations = await Reservation.find({
                table: { $in: tables.map(table => table._id) },
                reservationTime: {
                    $gte: reservationDateObj,
                    $lt: new Date(reservationDateObj.getTime() + 24 * 60 * 60 * 1000), // End of the day
                },
                timeSlot,  // Ensure we filter by timeSlot as well
                status: { $in: ["PENDING", "CONFIRMED"] },
            }).lean();

            // Step 3: Map reservations to table statuses
            const tableStatusMap: Record<string, string> = {};
            reservations.forEach(reservation => {
                if (reservation.table) {
                    tableStatusMap[reservation.table.toString()] = "RESERVED";
                }
            });

            // Step 4: Attach status to each table
            const tablesWithStatus = tables.map(table => ({
                ...table,
                status: table._id ? tableStatusMap[table._id.toString()] || 'AVAILABLE' : 'UNKNOWN',
            }));

            res.status(200).json(tablesWithStatus);
        } catch (error) {
            console.error("Error fetching tables:", error as any); // Log full error details
            res.status(500).json({ message: "Error fetching tables", error: (error as any).message });
        }
    }
);

// CHECK AVAILABILITY FOR ALL TABLES IN ALL SECTION FOR A GIVEN DATE AND TIME SLOT IF ANY TABLE IS AVAILABLE RETURN TRUE ELSE FALSE
// Route to check availability of tables for a given date and time slot
router.get("/availability/check-availability", async (req: Request, res: Response): Promise<void> => {
    // Extract reservationDate and timeSlot from query parameters
    const { reservationDate, timeSlot } = req.query as { reservationDate: string, timeSlot: string };
    const reservationDateObj = new Date(reservationDate);

    try {
        // Step 1: Find all tables
        const tables = await Table.find().lean();

        // Step 2: Find reservations for the specified date and time slot
        const reservations = await Reservation.find({
            table: { $in: tables.map(table => table._id) },
            reservationTime: {
                $gte: reservationDateObj,
                $lt: new Date(reservationDateObj.getTime() + 24 * 60 * 60 * 1000), // End of the day
            },
            timeSlot,  // Ensure we filter by timeSlot as well
            status: { $in: ["PENDING", "CONFIRMED"] },
        }).lean();

        // Step 3: Map reservations to table statuses
        const tableStatusMap: Record<string, string> = {};
        reservations.forEach(reservation => {
            if (reservation.table) {
                tableStatusMap[reservation.table.toString()] = "RESERVED";
            }
        });

        // Step 4: Attach status to each table
        const tablesWithStatus = tables.map(table => ({
            ...table,
            status: table._id ? tableStatusMap[table._id.toString()] || 'AVAILABLE' : 'UNKNOWN',
        }));

        // Step 5: Check if any table is available
        const isAvailable = tablesWithStatus.some(table => table.status === 'AVAILABLE');
        res.status(200).json({ isAvailable });
    } catch (error) {
        console.error("Error checking availability:", error as any); // Log full error details
        res.status(500).json({ message: "Error checking availability", error: (error as any).message });
    }
});

export default router;