"use client";

import React, { useState } from "react";
import SendIcon from '@mui/icons-material/Send';
import MainTitle from "@/app/components/maintitle";

export default function ContactUs() {
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
                        <h2 className="text-6xl font-semibold mb-3 ml-4">Contact your favorite restaurant</h2>
                        <p className="font-light ml-4">
                            Consectetur adipisicing elit. Cupiditate nesciunt amet facilis numquam, nam adipisci qui
                            voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem
                            ea
                            laborum.
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
                                <SendIcon/> Send Message
                            </button>
                        </form>
                    </div>
                </div>
                <div className="flex-1 flex justify-center">
                    <h2 className="text-6xl font-semibold mb-3 text-center">Our location</h2>

                </div>
            </div>
        </>
    );
}