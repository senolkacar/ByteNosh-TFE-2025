"use client";

import React, {useEffect, useState} from "react";
import SendIcon from '@mui/icons-material/Send';
import MainTitle from "@/app/components/home/maintitle";
import dynamic from 'next/dynamic';
import Config from "@/app/models/config";
import TimeSlot from "@/app/models/timeslot";
import toast,{Toaster} from "react-hot-toast";
import {z} from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

const Map = dynamic(() => import('../../components/map'), { ssr: false });

const schema = z.object({
    fullname: z.string().min(3, { message: "Please enter your name" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

export default function ContactUs() {
    const [config, setConfig] = useState<Config>();
    const [openingHours, setOpeningHours] = useState<TimeSlot[]>([]);
    useEffect(() => {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => setConfig(data))
            .catch(error => console.error('Error fetching config:', error));
    }, []);
    useEffect(() => {
        fetch('/api/opening-hours')
            .then(response => response.json())
            .then(data => setOpeningHours(data))
            .catch(error => console.error('Error fetching opening hours', error));
    }, []);


    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            fullname: "",
            email: "",
            message: ""
        }
    });

    const handleContactSubmit = async (data: any) => {
        try {
            await fetch('/api/contact?fullname=' + data.fullname + '&email=' + data.email + '&message=' + data.message, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            toast.success("Message sent successfully");
            form.reset();
        } catch (error) {
            toast.error("Error sending message");
    }
};

    return (
        <>
            <MainTitle title={"Contact Us"} description={"Contact Us"} linkText={"Home"}
            linkUrl={"/"}/>
            <div className="container mt-6 p-8">
                <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-3">
                        <h2 className="text-6xl font-semibold mb-3 ml-4">{config?.contact.title}</h2>
                        <p className="font-light ml-4">
                            {config?.contact.description}
                        </p>
                    </div>
                    <div className="flex-1 m-3">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleContactSubmit)} className="space-y-4">
                                <h2 className="text-4xl font-semibold text-center">Contact Us</h2>
                                <FormField
                                    control={form.control}
                                    name="fullname"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full Name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the your full name.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the your email.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter your message here..." {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter your message here please.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                    <button
                                        type="submit"
                                        className="w-full text-center py-3 rounded bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none my-1"
                                    >
                                        <SendIcon/> Send Message
                                        <Toaster/>
                                    </button>
                                </form>
                        </Form>
                    </div>
                </div>
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-center">Opening Hours</h2>
                    <div className="flex justify-center my-2">
                        <div className="w-full max-w-4xl">
                            <ul className="mx-auto">
                                {openingHours?.map((day, index) => (
                                    <li key={index} className="text-center">
                                        {day.day}: {new Date(day.openHour).toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })} - {new Date(day.closeHour).toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <h2 className="text-4xl font-semibold mb-6 text-center">Our Location</h2>
                    <div className="flex justify-center">
                        <div>
                            <p className="font-semibold text-center">{config?.contact.telephone}</p>
                            <p className="font-semibold text-center">Address: {config?.contact.address}</p>
                            <p className="font-semibold text-center">{config?.name}</p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl h-[400px]">
                            <Map/>
                        </div>
                    </div>
                </div>
            </div>
        </>
);
}
