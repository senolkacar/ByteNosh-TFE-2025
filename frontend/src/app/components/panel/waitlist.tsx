"use client";

import {useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {format} from "date-fns";

export default function Waitlist() {
    const [waitlists, setWaitlists] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to the Socket.io server
        const socket = io("http://localhost:5000", {
            withCredentials: true,
        });

        // Listen for 'waitlist-update' events from the server
        socket.on("waitlist-update", (update) => {
            if (update?.entry) {
                console.log("Waitlist update received:", update);
                setWaitlists((prevWaitlists) => [...prevWaitlists, update.entry]);
            } else {
                console.error("Received update with no data", update);
            }
        });

        // Cleanup the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);


    function handleNotify(waitlistId: string) {
        if (socket) {
            socket.emit("notify-customer", waitlistId); // Example event to notify customer
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