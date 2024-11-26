import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Timeslot, { DayOfWeek } from "@/app/models/timeslot";
import Closure from "@/app/models/closure";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useSession} from "next-auth/react";

type HoursMap = { [key in DayOfWeek]?: Timeslot };

const OpeningHoursConfig = () => {
    const [hours, setHours] = useState<HoursMap>({});
    const [date, setDate] = useState<Date>()
    const [closedDays, setClosedDays] = useState<Closure[]>([]);
    const [reason, setReason] = useState<string>("");

    const session = useSession();

    useEffect(() => {
        async function fetchClosures() {
            try {
                const response = await fetch("/api/closures");
                const data = await response.json();
                setClosedDays(data);
            } catch (error) {
                console.error("Failed to fetch closures", error);
            }
        }
        fetchClosures();
    }, []);

    useEffect(() => {
        async function fetchHours() {
            try {
                const response = await fetch("/api/opening-hours");
                const data: Timeslot[] = await response.json();
                const hoursData: HoursMap = {};
                data.forEach((timeslot) => {
                    hoursData[timeslot.day as DayOfWeek] = timeslot;
                });
                setHours(hoursData);
            } catch (error) {
                console.error("Failed to fetch opening hours", error);
            }
        }
        fetchHours();
    }, []);

    const handleChange = (day: DayOfWeek, key: keyof Timeslot, value: string | boolean) => {
        setHours((prev) => ({
            ...prev,
            [day]: { ...prev[day], [key]: value } as Timeslot,
        }));
    };


    const handleCloseDay = async () => {
        if (!date) {
            toast.error("Please select a date to close the restaurant for the day");
            return;
        }
        try {
            await fetch("/api/closures", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ date, reason }),
            });
            toast.success("Restaurant closed successfully");
            setClosedDays((prev) => [...prev, { date, reason }]);
        } catch (error) {
            console.error("Failed to close the restaurant", error);
            toast.error("Failed to close the restaurant");
        }
    }

    const handleOpenDay = async (day:Date) => {
        try {
            await fetch("/api/closures", {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ date: day }),
            });
            toast.success("Restaurant opened successfully");
            setClosedDays((prev) => prev.filter((d) => d.date !== day));
        } catch (error) {
            console.error("Failed to open the restaurant", error);
            toast.error("Failed to open the restaurant");
        }
    }

    const handleTimeChange = (day: DayOfWeek, key: "openHour" | "closeHour", timeValue: string) => {
        const updatedHours = { ...hours[day], [key]: timeValue } as Timeslot;

        if (key === "openHour" && updatedHours.closeHour && timeValue >= updatedHours.closeHour) {
            toast.error("Open hour must be before close hour");
            return;
        }

        if (key === "closeHour" && updatedHours.openHour && timeValue <= updatedHours.openHour) {
            toast.error("Close hour must be after open hour");
            return;
        }

        handleChange(day, key, timeValue);
    };



    const handleSave = () => {
        try{
            fetch("/api/opening-hours", {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.values(hours)),
            });
            toast.success("Opening hours saved successfully");
        } catch (error) {
            console.error("Failed to save opening hours", error);
            toast.error("Failed to save opening hours");
        }
    };

    return (
        <>
            <div className="space-y-4">
                <Toaster/>
                <h2 className={"text-lg font-semibold"}>Opening Hours</h2>
                <Separator orientation="horizontal"/>
                {Object.keys(hours).map((day) => (
                    <Collapsible key={day}>
                        <CollapsibleTrigger asChild>
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-md font-semibold">{day}</h3>
                                <ChevronRight/>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="flex items-center space-x-4 mt-2">
                                <Switch
                                    checked={!!hours[day as DayOfWeek]?.isOpen}
                                    onCheckedChange={(checked: boolean) => handleChange(day as DayOfWeek, "isOpen", checked)}
                                />
                                <Label>{hours[day as DayOfWeek]?.isOpen ? "Open" : "Closed"}</Label>
                                {hours[day as DayOfWeek]?.isOpen && (
                                    <>
                                        <Input
                                            type="time"
                                            value={hours[day as DayOfWeek]?.openHour || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleTimeChange(day as DayOfWeek, "openHour", e.target.value)
                                            }
                                        />
                                        <Input
                                            type="time"
                                            value={hours[day as DayOfWeek]?.closeHour || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleTimeChange(day as DayOfWeek, "closeHour", e.target.value)
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
            <div className="gap-4 mt-6">
                <h2 className="text-lg font-semibold mb-3">Close the restaurant</h2>
                <Separator orientation="horizontal"/>
                <div className="flex mt-3 gap-x-2">
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
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    placeholder="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <Button onClick={() => handleCloseDay()}
                disabled={!date}
                >
                    Close the restaurant</Button>
                </div>
                <Table className="mt-4">
                    <TableCaption> The restaurant is closed for the following days</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="flex-1">Closed day</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="flex justify-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {closedDays.map((closure) => (
                            <TableRow key={new Date(closure.date).toISOString()}>
                                <TableCell>{format(closure.date, "PPP")}</TableCell>
                                <TableCell>{closure.reason}</TableCell>
                                <TableCell className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleOpenDay(closure.date)}
                                    >
                                        Open
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default OpeningHoursConfig;