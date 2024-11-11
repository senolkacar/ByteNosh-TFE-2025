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
import Section from "@/app/models/section";

export default function TableDisplay({ date, timeSlot, onBack }: any) {
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<any | null>(null);
    const [guests, setGuests] = useState<number | null>(null);
    const [tablesData, setTablesData] = useState<any[]>([]);
    const [weatherMessage, setWeatherMessage] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = (table: any) => {
        setSelectedTable(table.name);
        console.log("TABLE CLICKED", table);
    };

    // Fetch sections and weather information when the component mounts
    useEffect(() => {
        async function fetchSections() {
            try {
                const response = await fetch("/api/sections");
                const sections = await response.json();
                setSections(sections);
            } catch (error) {
                console.error("Failed to fetch sections", error);
            }
        }

        async function fetchWeatherRecommendation() {
            if (!date) return;
            try {
                const response = await fetch(`/api/weather?date=${date.toISOString()}`);
                const weatherData = await response.json();
                setWeatherMessage(weatherData.message);
            } catch (error) {
                console.error("Failed to fetch weather recommendation", error);
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
            const response = await fetch(
                `/api/sections/${selectedSection._id}/tables?reservationDate=${date.toISOString()}&timeSlot=${timeSlot}`
            );
            console.log("Selected section", selectedSection);
            console.log("Selected date", date.toISOString());
            console.log("Selected time slot", timeSlot);
            if (!response.ok) {
                throw new Error("Failed to fetch tables");
            }

            const data = await response.json();
            setTablesData(data);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
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
        defaultValues: {
            section: "",
            guests: 0,
        },
    });

    const onSubmit = async (data: any) => {
        console.log(data);
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
                                                        const selected = sections.find(section => section._id === value);
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
                                                    placeholder="Please enter the number of guests"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const guestCount = Number(e.target.value);
                                                        field.onChange(guestCount);
                                                        setGuests(guestCount);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Enter the number of guests.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" onClick={handleTableSearch} className="mt-8">
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
                                    isSelected={selectedTable === table.name}
                                    isDisabled={isTableDisabled(table) || table.status === "RESERVED"}
                                    onSelect={() => !isTableDisabled(table) && handleSelect(table)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}