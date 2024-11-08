"use client";

import React, {useEffect, useState} from "react";
import SendIcon from '@mui/icons-material/Send';
import MainTitle from "@/app/components/home/maintitle";
import dynamic from 'next/dynamic';
import Config from "@/app/models/config";
import TimeSlot from "@/app/models/timeslot";

const Map = dynamic(() => import('../../components/map'), { ssr: false });

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

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            alert("Message sent successfully!");
        } else {
            alert("Failed to send message.");
        }
    };
    return (
        <>
            <MainTitle title={"Contact Us"} description={"Contact Us"} linkText={"Home"} linkUrl={"/"}/>
            <div className="container mt-6 p-8">
                <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-3">
                        <h2 className="text-6xl font-semibold mb-3 ml-4">{config?.contact.title}</h2>
                        <p className="font-light ml-4">
                            {config?.contact.description}
                        </p>
                    </div>
                    <div className="flex-1 m-3">
                        <form onSubmit={handleSubmit}
                              className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                            <h1 className="mb-8 text-3xl text-center">Send Message</h1>
                            <input
                                type="text"
                                className="block border border-grey-light w-full p-3 rounded mb-4"
                                name="fullname"
                                placeholder="Full Name"
                                value={formData.fullname}
                                onChange={handleChange}
                            />
                            <input
                                type="email"
                                className="block border border-grey-light w-full p-3 rounded mb-4"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <textarea
                                className="block border border-grey-light w-full p-3 rounded mb-4"
                                name="message"
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                            />
                            <button
                                type="submit"
                                className="w-full text-center py-3 rounded bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none my-1"
                            >
                                <SendIcon /> Send Message
                            </button>
                        </form>
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
