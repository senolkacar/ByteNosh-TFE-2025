import express, {Request, Response} from "express";
import {body, param, validationResult} from "express-validator";
import Table from "../models/table";
import {validateRole, validateToken} from "../auth";
import {getSocketIO} from "../utils/socket";
import calculateTableStatus from "../utils/update-table-status";

const router = express.Router();

router.put("/:id/occupy",
    validateToken,
    param('id').escape().isMongoId().withMessage('Invalid table ID'),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const tableId = req.params.id;
        try {
            const table = await Table.findById(tableId);
            if (table) {
                table.status = "OCCUPIED";
                table.occupiedUntil = new Date(new Date().setHours(23, 59, 59, 999));
                await table.save();
                const io = getSocketIO();
                io.emit("update-table-status", { tableId, status: "OCCUPIED" });

                res.status(200).json(table);
            } else {
                res.status(404).json({ message: "Table not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating table status" });
        }
    }
);

router.put("/:id/free",
    validateToken,
    param('id').escape().isMongoId().withMessage('Invalid table ID'),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const tableId = req.params.id;
        try {
            const table = await Table.findById(tableId);
            if (table) {
                table.status = "AVAILABLE";
                await table.save();
                const io = getSocketIO();
                io.emit("update-table-status", { tableId, status: "AVAILABLE" });

                res.status(200).json(table);
            } else {
                res.status(404).json({ message: "Table not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating table status" });
        }
    }
);


router.put("/:id",
    validateToken,
    param('id').escape().isMongoId().withMessage('Invalid table ID'),
    body('number').trim().escape().isNumeric().withMessage('Number is required'),
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('seats').trim().escape().isNumeric().withMessage('Seats is required'),
    body('isAvailable').trim().escape().isBoolean().withMessage('Is available is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const tableId = req.params.id;
        const updatedTable = req.body;
        try {
            const table = await Table.findById(tableId);
            if (table) {
                await Table.updateOne({ _id: tableId }, { $set: updatedTable });
                res.status(200).json(updatedTable);
            } else {
                res.status(404).json({ message: "Table not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error updating table" });
        }
    });

router.get('/section/:sectionId',
    validateToken,
    param('sectionId').escape().isMongoId().withMessage('Invalid section ID'),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const sectionId = req.params.sectionId;
        const { reservationDate, timeSlot } = req.query as { reservationDate: string, timeSlot: string };

        try {
            const tables = await Table.find({ section: sectionId }).lean();

            const tablesWithStatus = await Promise.all(tables.map(async (table) => {
                const status = await calculateTableStatus(table._id, reservationDate, timeSlot);
                return { ...table, status };
            }));

            res.json(tablesWithStatus);
        } catch (error) {
            res.status(500).json({ message: "Error fetching tables" });
        }
    });

router.post("/",
    validateToken,
    validateRole("ADMIN"),
    body('section').trim().escape().isString().isLength({ min: 1 }).withMessage('Section is required'),
    body('number').trim().escape().isNumeric().withMessage('Number is required'),
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('seats').trim().escape().isNumeric().withMessage('Seats is required'),
    body('isAvailable').trim().escape().isBoolean().withMessage('Is available is required'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const newTable = req.body;
        try {
            const table = await Table.create(newTable);
            res.status(201).json(table);
        } catch (error) {
            res.status(500).json({ message: "Error creating table" });
        }
    });

router.delete("/:id",
    validateToken,
    param('id').escape().isMongoId().withMessage('Invalid table ID'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const tableId = req.params.id;
        try {
            const table = await Table.findById(tableId);
            if (!table) {
                res.status(400).json({ message: "Table not found" });
                return;
            }
            await Table.deleteOne({ _id: tableId });
            res.json({ message: "Table deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting table" });
        }
});

export default router;