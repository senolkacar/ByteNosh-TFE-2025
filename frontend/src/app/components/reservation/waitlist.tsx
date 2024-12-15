"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {useSession} from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";

interface WaitlistProps {
    date: Date;
    timeSlot: string;
    guests: number;
    onWaitlistSubmitted: () => void;
}

export default function Waitlist({ date, timeSlot, guests, onWaitlistSubmitted }: WaitlistProps) {
    const [socket, setSocket] = useState<any | null>(null);
    const session = useSession();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [user, setUser] = useState(session.data?.user);
    const waitlistSchema = z.object({
        name: z.string().min(1, "Name is required"),
        contact: z.string().email("Invalid email address"),
        guests: z.number().min(1, "At least one guest is required"),
    });

    useEffect(() => {
        // Establish socket connection when component mounts
        const newSocket = io(`${apiBaseUrl}`, {
            withCredentials: true, // Include credentials if required by your server's CORS settings
        });
        setSocket(newSocket);

        // Cleanup function to disconnect socket when component unmounts
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            name: "",
            contact: "",
            guests:1,
        },
    });

    const onSubmit = async (data: any) => {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    reservationDate: dateString,
                    timeSlot,
                }),
            });

            if (response.ok) {
                toast.success("You have been added to the waitlist!");
                onWaitlistSubmitted();
                socket.emit("waitlist-update", { message: "New customer added to waitlist" });

            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to join the waitlist");
            }
        } catch (error) {
            console.error("Error submitting waitlist:", error);
            toast.error("An error occurred while submitting the waitlist");
        }
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Guests</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Number of Guests"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="btn">
                        Add to Waitlist
                    </Button>
                </form>
            </Form>
            <Toaster/>
        </div>
    );
}
