"use client";

import {useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {format} from "date-fns/format";

export default function Waitlist() {
    const [waitlists, setWaitlists] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Fetch existing waitlist data from the server on component mount
        async function fetchWaitlist() {
            try {
                const response = await fetch("/api/waitlist");
                const data = await response.json();
                const sortedData = data.sort((a: any, b: any) => a.createdAt - b.createdAt);
                setWaitlists(sortedData);
            } catch (error) {
                console.error("Error fetching waitlist entries:", error);
            }
        }

        fetchWaitlist();

        // Connect to the Socket.io server
        const socketInstance = io("http://localhost:5000", { withCredentials: true });
        setSocket(socketInstance);

        // Listen for real-time 'waitlist-update' events from the server
        socketInstance.on("waitlist-update", (update) => {
            if (update?.entry) {
                setWaitlists((prevWaitlists) => [...prevWaitlists, update.entry]);
            }
        });

        // Cleanup the socket connection when the component unmounts
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    function handleNotify(waitlistId: string) {
        if (socket) {
            socket.emit("notify-customer", waitlistId);
        }
    }

    return (
    <div>
      <h1 className="font-semibold">Waitlist</h1>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reservation Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {waitlists.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6}>No waitlist entries</TableCell>
                    </TableRow>
                ) : (
                    waitlists.map((waitlist) => (
                        <TableRow className="font-semibold" key={waitlist._id}>
                            <TableCell>{waitlist.name}</TableCell>
                            <TableCell>{waitlist.contact}</TableCell>
                            <TableCell>{waitlist.reservationDate ? format(new Date(waitlist.reservationDate), "dd/MM/yyyy") : "Invalid Date"}</TableCell>
                            <TableCell>{waitlist.timeSlot}</TableCell>
                            <TableCell>{waitlist.guests}</TableCell>
                            <TableCell>{waitlist.status}</TableCell>
                            <TableCell>
                                <Button onClick={()=>handleNotify(waitlist._id)}>Notify</Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
  );
}