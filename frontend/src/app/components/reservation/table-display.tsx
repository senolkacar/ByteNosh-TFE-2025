import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import ThermostatIcon from '@mui/icons-material/Thermostat';

export default function TableDisplay({ date, timeSlot, onBack } :any) {
    const [sections, setSections] = useState<string[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [guests, setGuests] = useState<number | null>(null);
    const [weatherMessage, setWeatherMessage] = useState<string | null>(null);


    useEffect(() => {
        async function fetchSections() {
            try {
                const response = await fetch("/api/sections");
                const sections = await response.json();
                setSections(sections.map((section: { name: string }) => section.name));
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


    const form = useForm(
        {
            defaultValues: {
                section: "",
                guests: 0,
            },
        }
    );

    const onSubmit = async (data: any) => {
       console.log(data);
    };

    const handleTableSearch= async () => {
        console.log("Table search");
    }

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
                    <h2 className="text-xl font-semibold">Table Reservation
                        for {date && date.toLocaleDateString()} at {timeSlot}</h2>
                    <p className="text-sm mb-4 mt-2">
                        <span className="font-semibold text-blue-600 bg-blue-300 rounded py-2 px-2"><ThermostatIcon/> {weatherMessage}</span>
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
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a section">
                                                            {field.value}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map((section) => (
                                                            <SelectItem key={section} value={section}>
                                                                {section}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormDescription>
                                                Please select a section.
                                            </FormDescription>
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
                                                <Input placeholder="Please enter the number of guests" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the number of guests.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" onClick={() => handleTableSearch()} className="mt-8">
                                    Search for Tables
                                </Button>

                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
