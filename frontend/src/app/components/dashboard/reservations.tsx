"use client";

import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {format} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Image from "next/image";

export default function Reservations() {
    const [reservations, setReservations] = useState<any[]>([]);
    const session = useSession();
    const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
    const [qrCodeData, setQRCodeData] = useState<string | null>(null);
    const userId = session.data?.user?.id;


    useEffect(() => {
        async function fetchReservations() {
            if (!userId) return;
            try {
                const response = await fetch(`/api/reservations/all/${userId}`);
                const data = await response.json();
                setReservations(data.reservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        }
        fetchReservations();
    }, [userId]);
    const handleReservationCancel = async (reservationId: string) => {
        try {
            const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: '' +
                    'PUT',
            });
            if (response.ok) {
                const updatedReservations = reservations.map((reservation) => {
                    if (reservation._id === reservationId) {
                        return {
                            ...reservation,
                            status: 'CANCELLED',
                        };
                    }
                    return reservation;
                });
                setReservations(updatedReservations);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        }
    }

    const handleQRCodeView = (qrCodeUrl: string) => {
        setQRCodeData(qrCodeUrl);
        setShowQRCodeDialog(true);
    };


    return (
        <Card className="xl:col-span-3" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Reservation History</CardTitle>
                    <CardDescription>
                        Recent reservations and their status
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reservation ID</TableHead>
                            <TableHead>Reservation Date</TableHead>
                            <TableHead>Reservation Time</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    You have no reservations yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservations.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                                .map((reservation) => (
                                    <TableRow key={reservation._id}>
                                        <TableCell>
                                            <div className="font-medium">{reservation._id}</div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(reservation.reservationTime), "dd-MM-yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.timeSlot}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.table.name}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.section.name}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.guests}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                reservation.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                            }>
                                                {reservation.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {new Date(reservation.reservationTime) > new Date() && reservation.status !== "CANCELLED" && (
                                                <Button onClick={() => handleReservationCancel(reservation._id)}>
                                                    Cancel
                                                </Button>
                                            )}
                                            {reservation.status !== "CANCELLED" && (
                                                <Button className="mt-2" onClick={() => handleQRCodeView(reservation.qrCodeUrl)}>
                                                    View QR Code
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                {showQRCodeDialog && (
                    <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                                {qrCodeData && <Image src={qrCodeData} alt="QR Code" />}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setShowQRCodeDialog(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}