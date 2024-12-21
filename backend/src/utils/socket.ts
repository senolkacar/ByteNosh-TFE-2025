// socket.ts
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import Waitlist from "../models/waitlist";
import {notifyCustomer} from "./notify-customer";

let io: SocketIOServer;

// Function to initialize Socket.io
export const initializeSocket = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_BASE_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A client connected:", socket.id);

        socket.on("waitlist-update", (data) => {
            console.log("Received waitlist update:", data);
            io.emit("waitlist-update", data); // Broadcast to all clients
        });

        socket.on("notify-customer", async (waitlistId) => {
            try {
                // Find the waitlist entry by ID
                const waitlistEntry = await Waitlist.findById(waitlistId);

                if (!waitlistEntry) {
                    console.error(`Waitlist entry with ID ${waitlistId} not found.`);
                    return;
                }

                // Perform the notification (send a mail)
                await notifyCustomer(waitlistEntry.contact, "A table is now available!");

                // Update the status in the database
                waitlistEntry.status = "NOTIFIED";
                await waitlistEntry.save();

                // Broadcast the updated entry back to all clients
                io.emit("waitlist-update", { message: "Customer notified", entry: waitlistEntry });
                console.log(`Notified customer with ID ${waitlistId}`);
            } catch (error) {
                console.error("Error notifying customer:", error);
            }
        });

        socket.on("update-table-status", (data) => {
            io.emit("update-table-status", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

// Function to get the io instance for use elsewhere
export const getSocketIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized");
    }
    return io;
};
