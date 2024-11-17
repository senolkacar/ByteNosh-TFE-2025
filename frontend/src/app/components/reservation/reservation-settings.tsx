import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import Waitlist from "@/app/components/reservation/waitlist";
import toast from "react-hot-toast";

export default function ReservationSettings({ onCheckAvailability }: any) {
    const [closureDays, setClosureDays] = useState<Date[]>([]);
    const [date, setDate] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [disabledDays, setDisabledDays] = useState<string[]>([]);
    const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
    const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isTimeSlotEmpty, setIsTimeSlotEmpty] = useState(false);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);

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
        if (date) {
            fetchOpeningHoursForDate(date);
        }
    }, [date]);

    useEffect(() => {
        const checkInactivity = () => {
            const now = new Date();
            if (now.getTime() - lastActivityTime.getTime() > 5 * 60 * 1000) { // 5 minutes
                if (date) {
                    fetchOpeningHoursForDate(date);
                }
            }
        };

        inactivityTimeout.current = setInterval(checkInactivity, 60 * 1000); // Check every minute

        return () => {
            if (inactivityTimeout.current) {
                clearInterval(inactivityTimeout.current);
            }
        };
    }, [lastActivityTime, date]);

    const fetchOpeningHoursForDate = async (selectedDate: Date) => {
        try {
            const response = await fetch(`/api/opening-hours?date=${selectedDate.toISOString()}`);
            const { openHour, closeHour } = await response.json();
            generateTimeSlots(selectedDate, openHour, closeHour);
        } catch (error) {
            console.error("Failed to fetch opening hours", error);
        }
    };

    const handleCheckAvailability = async (date: any, selectedTimeSlot: any) => {
        const response = await fetch(`/api/sections/availability/check-availability?reservationDate=${date.toISOString()}&timeSlot=${selectedTimeSlot}`);
        const availabilityData = await response.json();

        if (availabilityData.allSectionsFull) {
            setShowWaitlistModal(true);
        } else {
            setShowWaitlistModal(false);
            onCheckAvailability(date, selectedTimeSlot);
        }
    };

    const generateTimeSlots = (date: Date, openHour: string, closeHour: string) => {
        const slots = [];
        let allSlotsPassed = true;

        // Parse `openHour` and `closeHour` into `Date` objects based on the selected `date`
        const startDateTime = new Date(date);
        const [openHourHours, openHourMinutes] = openHour.split(':').map(Number);
        startDateTime.setHours(openHourHours, openHourMinutes, 0, 0);

        const endDateTime = new Date(date);
        const [closeHourHours, closeHourMinutes] = closeHour.split(':').map(Number);
        endDateTime.setHours(closeHourHours, closeHourMinutes, 0, 0);

        let current = startDateTime;

        // Generate slots from `current` to `endDateTime`
        while (current < endDateTime) {
            const next = new Date(current);
            next.setHours(current.getHours() + 1);
            slots.push(`${format(current, "HH:mm")} - ${format(next, "HH:mm")}`);


            // Check if the current slot is in the future
            if (new Date(`${date.toDateString()} ${current.toTimeString().split(' ')[0]}`) >= new Date()) {
                allSlotsPassed = false;
            }

            current = next;
        }

        setTimeSlots(slots);
        setIsTimeSlotEmpty(allSlotsPassed);
    };

    const handleTimeSlotSelect = (slot: string) => {
        setSelectedTimeSlot(slot);
        setLastActivityTime(new Date());
    };

    const handleDateSelect = (selectedDate: Date | null) => {
        if (!selectedDate) return;
        setDate(selectedDate);
        setSelectedTimeSlot(null);
        setLastActivityTime(new Date());
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
                                    disabled={(selectedDate) =>
                                        selectedDate < new Date(new Date().setHours(0, 0, 0, 0)) || // Convert timestamp to Date
                                        closureDays.some(closure => closure.toDateString() === selectedDate.toDateString()) ||
                                        disabledDays.includes(selectedDate.toLocaleDateString('en-US', { weekday: 'long' })) ||
                                        (selectedDate.toDateString() === date?.toDateString() && isTimeSlotEmpty)  // Disable if all slots are in the past
                                    }
                                    mode="single"
                                    selected={date || undefined}
                                    onSelect={(day: Date | undefined) => handleDateSelect(day || null)}
                                    weekStartsOn={1}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <div>
                            <p className="font-semibold text-sm">Available Time Slots</p>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {timeSlots.map((slot) => {
                                    if (!date) return null;
                                    const [startTime] = slot.split(" - ");
                                    const timeslotStart = new Date(`${date.toDateString()} ${startTime}`);
                                    const now = new Date();

                                    // Convert Date objects to timestamps (numbers)
                                    const timeslotStartTime = timeslotStart.getTime();
                                    const nowTime = now.getTime();

                                    const isDisabled = timeslotStartTime < nowTime || (timeslotStartTime - nowTime) / (1000 * 60 * 60) < 1; // less than 1 hour
                                    const handleClick = () => {
                                        if (!isDisabled) {
                                            handleTimeSlotSelect(slot);
                                        }
                                    };

                                    return (
                                        <Badge
                                            key={slot}
                                            className={`py-1 px-2 text-xs font-semibold ${
                                                selectedTimeSlot === slot ? 'bg-green-500 text-white' : ''
                                            } ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'hover:bg-green-500 hover:cursor-pointer'}`}
                                            onClick={handleClick}
                                        >
                                            {slot}
                                        </Badge>
                                    );
                                })}
                            </div>
                            <Button
                                onClick={() => {
                                    if (date && selectedTimeSlot) {
                                        handleCheckAvailability(date, selectedTimeSlot);
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
            <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join the Waitlist</DialogTitle>
                        <DialogDescription className="font-semibold text-red-500">
                            All tables are currently booked for this section and time slot. <br/> Join the waitlist, and we’ll notify you if a table becomes available.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {showWaitlistModal && date && selectedTimeSlot ?  (
                            <Waitlist
                                date={date}
                                timeSlot={selectedTimeSlot}
                                guests={0}
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
                        <Button onClick={() => setShowWaitlistModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}