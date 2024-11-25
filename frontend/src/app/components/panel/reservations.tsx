import { useEffect, useState } from "react";
import {collection, onSnapshot, orderBy} from "@firebase/firestore";
import db from "@/lib/firebase";
import {doc, query, updateDoc, where} from "firebase/firestore";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import {useSession} from "next-auth/react";

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [selectedReservationData, setSelectedReservationData] = useState<any | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const session = useSession();

    useEffect(() => {
        const q = query(
            collection(db, "reservations"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reservationData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReservations(reservationData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedReservationId) {
            fetch('/api/reservations/' + selectedReservationId, {
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => setSelectedReservationData(data.reservation))
                .catch(error => console.error('Error fetching reservation details:', error));
        }
    }, [selectedReservationId]);

    const handleReservationDetails = (reservationId: string) => {
        setSelectedReservationId(reservationId);
    };

    const handleMarkAsRead = async (reservationId: string) => {
        try {
            // Create a reference to the reservation document in Firestore
            const reservationRef = doc(db, "reservations", reservationId);

            // Update the isRead field to true
            await updateDoc(reservationRef, { isRead: true });

            // Update the local state for immediate UI feedback
            setReservations(prevReservations =>
                prevReservations.map(reservation =>
                    reservation.id === reservationId ? { ...reservation, isRead: true } : reservation
                )
            );

            toast.success('Marked as read');
        } catch (error) {
            console.error('Error marking reservation as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleCancelReservation = (reservationId: string) => {
        fetch('/api/reservations/' + reservationId + '/cancel', {
            headers: {
                'Authorization': `Bearer ${session.data?.accessToken}`,
                'Content-Type': 'application/json',
            },
            method: 'PUT',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setReservations(reservations.map(reservation => {
                        if (reservation.id === reservationId) {
                            return { ...reservation, status: "CANCELLED" };
                        }
                        return reservation;
                    }));
                    toast.success('Reservation cancelled successfully');
                }
            })
            .catch(error => console.error('Error cancelling reservation:', error));
        setSelectedReservationId(null);
    }

    return (
        <div>
            <h1>Reservations</h1>
            <Table>
                <TableCaption>Reservations</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reservation ID</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Reservation Date</TableHead>
                        <TableHead>Reservation Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reservations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                NO RESERVATION FOUND
                            </TableCell>
                        </TableRow>
                    ) : (
                        reservations.map((reservation: any) => (
                            <TableRow
                                className="hover:cursor-pointer"
                                key={reservation.id}
                                onClick={() => handleReservationDetails(reservation.id)}
                            >
                                <TableCell>{reservation.id}</TableCell>
                                <TableCell>{reservation.guests}</TableCell>
                                <TableCell>
                                    {new Date(reservation.reservationTime?.seconds * 1000).toLocaleDateString('en-GB')}
                                </TableCell>
                                <TableCell>{reservation.timeSlot}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={reservation.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                        {reservation.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(reservation.createdAt).toLocaleDateString('en-GB')}
                                </TableCell>
                                <TableCell>
                                    {!reservation.isRead && (
                                        <Button onClick={() => handleMarkAsRead(reservation.id)}>
                                            Mark as read
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {selectedReservationData && (
                <Dialog open={!!selectedReservationId} onOpenChange={() => setSelectedReservationId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reservation Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 text-xl font-semibold">User Information</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p>{selectedReservationData.user?.fullName || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">User ID</p>
                                    <p>{selectedReservationData.user?._id || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="col-span-2 text-xl font-semibold">Reservation Details</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Reservation Date</p>
                                    <p>{format(new Date(selectedReservationData.reservationTime), "dd/MM/yyyy")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Time Slot</p>
                                    <p>{selectedReservationData.timeSlot}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Guests</p>
                                    <p>{selectedReservationData.guests}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge variant="outline" className={selectedReservationData.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                        {selectedReservationData.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="col-span-2 text-xl font-semibold">Location</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Section</p>
                                    <p>{selectedReservationData.section?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Table</p>
                                    <p>{selectedReservationData.table?.name || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                        <Toaster/>
                        <DialogFooter>
                            <div className="w-full flex justify-between items-center">
                                <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={selectedReservationData.status==="CANCELLED"} onClick={() => setIsCancelDialogOpen(true)}>
                                            Cancel Reservation
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently cancel the reservation.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setIsCancelDialogOpen(false)}>
                                                No, go back
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    handleCancelReservation(selectedReservationData._id);
                                                    setIsCancelDialogOpen(false);
                                                }}
                                            >
                                                Yes, cancel
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button onClick={() => setSelectedReservationId(null)}>Close</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            )}
        </div>
    );
}
