"use client";

import Link from "next/link"
import {
    Activity,
    ArrowUpRight,
    Bell,
    Users,
    ShoppingBasket, CalendarDays,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {format} from "date-fns";

export function ClientDashboard({ setActiveSection }: { setActiveSection: (section: string) => void }) {
    const [upcomingReservation, setUpcomingReservation] = useState<any | null>(null);
    const [lastReservation, setLastReservation] = useState<any | null>(null);
    const [notifications, setNotifications] = useState();
    const [lastOrder, setLastOrder] = useState(0);
    const [reservations, setReservations] = useState<any[]>([]);

    const session = useSession();
    const userId = session.data?.user?.id;
    useEffect(() => {
        if (!userId) return;

        async function fetchLastReservation() {
            try {
                const response = await fetch(`/api/reservations/last/${userId}`);
                const data = await response.json();
                setLastReservation(data);

                const reservationTime = new Date(data.reservation.reservationTime);
                const currentTime = new Date();

                if (reservationTime > currentTime) {
                    try {
                        const response = await fetch(`/api/reservations/${data.reservation._id}`);
                        const reservationData = await response.json();
                        setUpcomingReservation(reservationData);
                    } catch (error) {
                        console.error('Error fetching reservation information:', error);
                    }
                }

                try{
                    const response = await fetch(`/api/orders/${userId}`);
                    const totalAmount = await response.json();
                    setLastOrder(totalAmount.totalSum);
                } catch (error) {
                    console.error('Error fetching last order:', error);
                }

                try {
                    const response = await fetch(`/api/reservations/all/${userId}`);
                    const data = await response.json();
                    setReservations(data.reservations);
                } catch (error) {
                    console.error('Error fetching reservations:', error);
                }

            } catch (error) {
                console.error('Error fetching last reservation:', error);
            }
        }
        fetchLastReservation();
    }, [userId]);

    const handleReservationCancel = async (reservationId: string) => {
        try {
            const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: 'PUT',
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
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        }
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card x-chunk="dashboard-01-chunk-0">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Upcoming Reservation
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!upcomingReservation ? (
                            <>
                                <div className="text-md font-bold">No upcoming reservations</div>
                                <p className="text-xs text-muted-foreground">
                                    You don't have any reservations yet
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold">{format(new Date(upcomingReservation.reservation.reservationTime), "dd/MM/yyyy")}<br/> {upcomingReservation.reservation.timeSlot}</div>
                                <p className="text-xs text-muted-foreground">{upcomingReservation.reservation.table.name}, {upcomingReservation.reservation.guests} guests</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Last Reservation
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!lastReservation ? (
                            <>
                                <div className="text-md font-bold">No reservations</div>
                                <p className="text-xs text-muted-foreground">
                                    You haven't made any reservations yet
                                </p>
                            </>
                        ) : (lastReservation.reservation.status !== 'CANCELED') && (
                            <>
                                <div className="text-2xl font-bold">{format(new Date(lastReservation.reservation.reservationTime), "dd/MM/yyyy")}</div>
                                <p className="text-xs text-muted-foreground">
                                    Your last reservation
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-md font-bold">2 new notifications</div>
                        <p className="text-xs text-muted-foreground">
                            New event: Christmas Dinner Special!
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Last Order
                        </CardTitle>
                        <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lastOrder}€</div>
                        <p className="text-xs text-muted-foreground">
                            from {lastReservation ? format(new Date(lastReservation.reservation.reservationTime), "dd/MM/yyyy") : "No reservations"}
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
    <Card className="xl:col-span-3" x-chunk="dashboard-01-chunk-4">
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Reservation History</CardTitle>
                <CardDescription>
                    Recent reservations and their status
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#" onClick={() => setActiveSection("Reservations")}>
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reservation ID</TableHead>
                        <TableHead>Reservation Date</TableHead>
                        <TableHead>Reservation Time</TableHead>
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
                        reservations.sort((a, b) => new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime())
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
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
</div>
        </main>
    )
}
