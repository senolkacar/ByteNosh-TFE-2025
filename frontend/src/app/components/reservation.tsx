"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";

export default function ReservationsPage() {
    const reservations = [
        {
            id: "R001",
            status: "Confirmed",
            date: "2024-08-15",
            time: "7:00 PM",
            guests: 4,
        },
        {
            id: "R002",
            status: "Pending",
            date: "2024-08-18",
            time: "8:00 PM",
            guests: 2,
        },
        {
            id: "R003",
            status: "Cancelled",
            date: "2024-08-20",
            time: "6:30 PM",
            guests: 3,
        },
    ];

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Reservations</CardTitle>
                    <CardDescription>
                        Review your upcoming reservations and their statuses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reservation ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">Guests</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell>{reservation.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            reservation.status === "Confirmed"
                                                ? "secondary"
                                                : reservation.status === "Pending"
                                                    ? "outline"
                                                    : "destructive"
                                        }>
                                            {reservation.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{reservation.date}</TableCell>
                                    <TableCell>{reservation.time}</TableCell>
                                    <TableCell className="text-right">
                                        {reservation.guests}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button asChild className="mt-4">
                        <Link href="#">
                            View All Reservations <CalendarIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
