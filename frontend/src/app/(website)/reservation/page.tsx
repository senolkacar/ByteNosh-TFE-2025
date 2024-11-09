"use client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useEffect, useState} from "react";
import {Card,CardHeader,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {Input} from "@/components/ui/input";

export default function ReservationSettings() {
    const [closureDays, setClosureDays] = useState<Date[]>([]);
    const [date, setDate] = useState<Date>();
    const [openingHours, setOpeningHours] = useState<Date[]>([]);

    useEffect(() => {
        async function fetchClosureDays() {
            try {
                const response = await fetch("/api/closures");
                const closures = await response.json();
                setClosureDays(closures.map((closure: { date: string }) => new Date(closure.date)));
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        }

        fetchClosureDays();
    }, []);

    useEffect(() => {
        async function fetchOpeningHours() {
            if(!date) return;
            try {
                const response = await fetch(`/api/opening-hours?date=${date?.toISOString()}`);
                const timeslot = await response.json();
                setOpeningHours(timeslot.map((timeslot: { date: string }) => new Date(timeslot.date)));
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        }

        fetchOpeningHours();
    }, []);


    return (
        <>
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-bold">Please select a date for your reservation</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <p className={"font-semibold text-sm"}>Pick a Date:</p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[280px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon/>
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        disabled={date => date < new Date() || closureDays.some(closure => closure.toDateString() === date.toDateString())}
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <div>
                                <p className={"font-semibold text-sm"}>Available Time Slots</p>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <Badge className="py-1 px-2 text-xs font-semibold">9:00 - 10:00</Badge>
                                    <Badge className="py-1 px-2 text-xs font-semibold">10:00 - 11:00</Badge>
                                    <Badge className="py-1 px-2 text-xs font-semibold">12:00 - 13:00</Badge>
                                    <Badge className="py-1 px-2 text-xs font-semibold">14:00 - 15:00</Badge>
                                    <Badge className="py-1 px-2 text-xs font-semibold">16:00 - 17:00</Badge>
                                    <Badge className="py-1 px-2 text-xs font-semibold">18:00 - 19:00</Badge>
                                </div>
                                <Link
                                    href="#"
                                    className="w-full flex justify-center mt-4 py-2 text-center bg-blue-500 text-white rounded-md"
                                    prefetch={false}
                                >
                                    Check Availability
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}