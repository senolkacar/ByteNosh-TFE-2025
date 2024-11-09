import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ReservationSettings({ onCheckAvailability }:any) {
    const [closureDays, setClosureDays] = useState<Date[]>([]);
    const [date, setDate] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [disabledDays, setDisabledDays] = useState<string[]>([]);

    useEffect(() => {
        async function fetchClosureDays() {
            try {
                const response = await fetch("/api/closures");
                const closures = await response.json();
                setClosureDays(closures.map((closure: { date: string }) => new Date(closure.date)));
            } catch (error) {
                console.error("Failed to fetch closure days", error);
            }
        }
        fetchClosureDays();
    }, []);

    useEffect(() => {
        async function fetchOpeningHours() {
            try {
                const response = await fetch("/api/opening-hours");
                const openingHours = await response.json();
                const closedDays = openingHours
                    .filter((day: { isOpen: boolean }) => !day.isOpen)
                    .map((day: { day: string }) => day.day);
                setDisabledDays(closedDays);
            } catch (error) {
                console.error("Failed to fetch opening hours", error);
            }
        }

        fetchOpeningHours();
    }, []);

    useEffect(() => {
        async function fetchOpeningHoursForDate() {
            if (!date) return;
            try {
                const response = await fetch(`/api/opening-hours?date=${date.toISOString()}`);
                const { openHour, closeHour } = await response.json();
                generateTimeSlots(openHour, closeHour);
            } catch (error) {
                console.error("Failed to fetch opening hours", error);
            }
        }
        fetchOpeningHoursForDate();
    }, [date]);

    const generateTimeSlots = (start: string, end: string) => {
        const slots = [];
        let current = new Date(start);
        const endDateTime = new Date(end);

        while (current < endDateTime) {
            const next = new Date(current);
            next.setHours(current.getHours() + 1);
            slots.push(`${format(current, "HH:mm")} - ${format(next, "HH:mm")}`);
            current = next;
        }
        setTimeSlots(slots);
    };

    const handleTimeSlotSelect = (slot: string) => {
        setSelectedTimeSlot(slot);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setDate(date);
        setSelectedTimeSlot(null);
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
                    <h2 className="text-lg font-bold">Please select a date for your reservation</h2>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    disabled={date =>
                                        date < new Date() ||
                                        closureDays.some(closure => closure.toDateString() === date.toDateString()) ||
                                        disabledDays.includes(date.toLocaleDateString('en-US', { weekday: 'long' }))
                                    }
                                    mode="single"
                                    selected={date || undefined}
                                    onSelect={(day) => handleDateSelect(day)}
                                    weekStartsOn={1}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <div>
                            <p className={"font-semibold text-sm"}>Available Time Slots</p>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {timeSlots.map((slot) => (
                                    <Badge
                                        key={slot}
                                        className={`py-1 px-2 text-xs font-semibold hover:bg-green500 hover:cursor-pointer  ${selectedTimeSlot === slot ? 'bg-green-500 text-white' : ''}`}
                                        onClick={() => handleTimeSlotSelect(slot)}
                                    >
                                        {slot}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                onClick={() => {
                                    if (date && selectedTimeSlot) {
                                        onCheckAvailability(date, selectedTimeSlot);
                                    }
                                }}
                                className="w-full mt-4 py-2 text-center bg-blue-500 text-white rounded-md"
                            >
                                Check Availability
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
