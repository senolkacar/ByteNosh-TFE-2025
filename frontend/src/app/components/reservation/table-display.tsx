import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Table from "@/app/components/reservation/table";
import TableModel from "@/app/models/table";
import { z } from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import { CircularProgress } from "@mui/material";
import ReservationModel from "@/app/models/reservation";
import Waitlist from "@/app/components/reservation/waitlist";
import toast, {Toaster} from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

const schema = z.object({
    section: z.string().min(1, { message: "Please select a section" }),
    guests: z.number().min(1).max(6, { message: "Please enter a number between 1 and 6" }),
});

export default function TableDisplay({ date, timeSlot, onBack }: any) {
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<any | null>(null);
    const [guests, setGuests] = useState<number | null>(null);
    const [tablesData, setTablesData] = useState<any[]>([]);
    const [weatherMessage, setWeatherMessage] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [reservation, setReservation] = useState<ReservationModel | null>(null);
    const [reservationConfirmed, setReservationConfirmed] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const session = useSession();
    const [noTableAvailable, setNoTableAvailable] = useState(false);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);

    const handleSelect = (table: any) => {
        setSelectedTable(table);
    };

    // Fetch sections and weather information when the component mounts
    useEffect(() => {
        async function fetchSections() {
            try {
                const response = await fetch("/api/sections");
                const sections = await response.json();
                setSections(sections);
            } catch (error:any) {
                console.error("Failed to fetch sections", error);
            }
        }
        async function fetchWeatherRecommendation() {
            if (!date) return;
            try {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                const response = await fetch(`/api/weather?date=${dateString}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    setWeatherMessage(errorData.error || "Failed to fetch weather data");
                    return;
                }
                const weatherData = await response.json();
                setWeatherMessage(weatherData.message);
            } catch (error: any) {
                console.error("Failed to fetch weather recommendation", error);
                setWeatherMessage(error.message || "Failed to fetch weather data");
            }
        }

        fetchSections();
        fetchWeatherRecommendation();
    }, [date]);

    // Fetch tables for the selected section, date, and timeSlot
    const handleTableSearch = async () => {
        if (!selectedSection || !date || !timeSlot) {
            setError("Please select a section, date, and time slot.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const response = await fetch(
                `/api/sections/${selectedSection._id}/tables?reservationDate=${dateString}&timeSlot=${timeSlot}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.data?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch tables");
            }

            const data = await response.json();
            const selectableTables = data.filter((table: any) => !isTableDisabled(table) && table.status !== "RESERVED");

            if (selectableTables.length > 0) {
                setNoTableAvailable(false);
            } else {
                setNoTableAvailable(true);
                setShowWaitlistModal(true);
            }

            setTablesData(data);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleWaitlistSubmit = async (formData : any) => {
        // Send waitlist data to your backend
        await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, date, timeSlot, section: selectedSection._id }),
        });
        alert("You have been added to the waitlist.");
        setShowWaitlistModal(false);
    };

    const isTableDisabled = (table: any) => {
        if (guests === null) return false;
        if (guests === 1) {
            return table.seats !== 2;
        }
        if (guests === 2) {
            return table.seats === 6 || (table.seats === 4 && tablesData.some((t) => t.seats === 2 && t.status !== 'RESERVED'));
        }
        if (guests > 2 && guests <= 4) {
            return table.seats === 2 || (table.seats === 6 && tablesData.some((t) => t.seats === 4 && t.status !== 'RESERVED'));
        }
        if (guests > 4) {
            return table.seats !== 6;
        }
        return false;
    };

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            section: "",
            guests: 0,
        },
    });

    const onSubmit = async (data: any) => {
        console.log(data);
    };

    const handleReservation = async () => {
        setLoading(true);
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tableId: selectedTable?._id,
                    sectionId: selectedSection._id,
                    guests,
                    reservationDate: dateString,
                    timeSlot,
                    userId: session.data?.user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save reservation");
            }

            const confirmedReservation = await response.json();
            setQrCodeUrl(confirmedReservation.qrCodeUrl);
            setReservationConfirmed(true);
            console.log("Reservation confirmed:", confirmedReservation);
            setReservation(confirmedReservation.reservation);

            // Optionally, show a success message or navigate to a confirmation page
        } catch (error:any) {
            console.error("Error saving reservation:", error);
            setError(error.message || "Failed to save reservation");
        }finally {
            setLoading(false);
        }
    };

    const handleGuestsChange = (value: number) => {
        if(value>0 && value<=6){
            setGuests(value);
        }else{
            return;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center h-screen bg-gray-100"
        >
            <Card>
                <CardHeader>
                    <Button onClick={onBack} className="mb-4 w-1/5">
                        Go Back
                    </Button>
                    <h2 className="text-xl font-semibold">
                        Table Reservation for {date && date.toLocaleDateString()} at {timeSlot}
                    </h2>
                    <p className="text-sm mb-4 mt-2">
                    <span className="font-semibold text-blue-600 bg-blue-300 rounded py-2 px-2">
                        <ThermostatIcon /> {weatherMessage}
                    </span>
                    </p>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center my-2">
                            <CircularProgress />
                        </div>
                    ) : reservationConfirmed ? (
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-green-600 mb-4">
                                Reservation Confirmed!
                            </h3>
                            {qrCodeUrl && (
                                <Image width="400" height="400" src={qrCodeUrl} alt="Reservation QR Code" className="mx-auto mb-4" />
                            )}
                            <p>
                                Thank you for your reservation,{" "}
                                <span className="font-semibold">{session.data?.user?.fullName}</span>
                            </p>
                            <p>
                                Your reservation has been confirmed for
                                <span className="font-semibold">
                                {" "}
                                    {reservation?.reservationTime
                                        ? new Date(reservation.reservationTime).toLocaleDateString("en-GB")
                                        : ""}
                            </span>{" "}
                                at
                                <span className="font-semibold"> {reservation?.timeSlot} </span>
                            </p>
                            <p>
                                You can find the QR code in your account under reservations and on your mobile
                                app.
                            </p>
                            <p>This QR code will provide you easy access to your reservation.</p>
                        </div>
                    ) : (
                        <>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="flex space-x-4">
                                        <FormField
                                            control={form.control}
                                            name="section"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Section</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const selected = sections.find(
                                                                    (section) => section._id === value
                                                                );
                                                                field.onChange(selected?._id);
                                                                setSelectedSection(selected);
                                                            }}
                                                            value={selectedSection?._id}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a section">
                                                                    {selectedSection?.name || "Select a section"}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sections.map((section) => (
                                                                    <SelectItem key={section._id} value={section._id}>
                                                                        {section.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormDescription>Please select a section.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="guests"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Guests number</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            placeholder="Please enter the number of guests"
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target.value === ""
                                                                        ? null
                                                                        : parseInt(e.target.value);
                                                                field.onChange(value);
                                                                handleGuestsChange(value === null ? 0 : value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Enter the number of guests.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            disabled={!form.formState.isValid}
                                            type="button"
                                            onClick={handleTableSearch}
                                            className="mt-8"
                                        >
                                            Search for Tables
                                        </Button>
                                    </div>
                                </form>
                            </Form>

                            {/* Display loading, error, or tables */}
                            {loading ? (
                                <p>Loading tables...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-8 place-items-center">
                                    {tablesData.map((table, index) => (
                                        <Table
                                            key={index}
                                            seats={table.seats}
                                            name={table.name}
                                            isReserved={table.status === "RESERVED"}
                                            isSelected={selectedTable?.name === table.name}
                                            isDisabled={
                                                isTableDisabled(table) || table.status === "RESERVED"
                                            }
                                            onSelect={() => !isTableDisabled(table) && handleSelect(table)}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="flex space-x-4 mt-4 justify-end">
                                {/* Available Table */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-400 rounded"></div>
                                    <span className="text-gray-600">Available</span>
                                </div>

                                {/* Not Available Table */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-gray-200 rounded"></div>
                                    <span className="text-gray-600">Not Available</span>
                                </div>
                            </div>
                            <Button
                                className="mt-8 mx-auto block w-1/3"
                                disabled={!selectedTable || !selectedSection || !guests || noTableAvailable}
                                onClick={() => handleReservation()}
                            >
                                Confirm Reservation
                            </Button>

                            {/* Waitlist Option Inside Card */}
                            <Dialog open={noTableAvailable} onOpenChange={setShowWaitlistModal}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Join the Waitlist</DialogTitle>
                                        <DialogDescription className="font-semibold text-red-500">
                                            All tables are currently booked for this section and time slot. Join the waitlist, and we’ll notify you if a table becomes available.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4">
                                        {showWaitlistModal ? (
                                            <Waitlist
                                                date={date}
                                                timeSlot={timeSlot}
                                                guests={guests || 0}
                                                onWaitlistSubmitted={() => {
                                                    setShowWaitlistModal(false);
                                                    toast.success("You have been added to the waitlist!");
                                                }}
                                            />
                                        ) : (
                                            <Button onClick={() => setShowWaitlistModal(true)}>Join Waitlist</Button>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setNoTableAvailable(false)}>Close</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </CardContent>
            </Card>
            <Toaster />
        </motion.div>
    );
}