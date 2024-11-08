"use client";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import {useEffect, useState} from "react";
import Config from "@/app/models/config";
import Link from "next/link";
import TimeSlot from "@/app/models/timeslot";

export default function Footer() {
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
    return (
        <footer className="bg-black text-white py-5 rounded">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                {/* About Section */}
                <div className="flex-1 items-start">
                    <h2 className="font-semibold text-lg mb-4">About Restaurant</h2>
                    <p className="text-gray-400">
                        {config?.about}
                    </p>
                    <div className="mt-4 flex justify-center md:justify-start">
                        {/* Social icons */}
                        <a href={config?.social.facebook} className="text-gray-400 hover:text-white mx-2">
                            <FacebookIcon/>
                        </a>
                        <a href={config?.social.instagram} className="text-gray-400 hover:text-white mx-2">
                            <InstagramIcon/>
                        </a>
                        <a href={config?.social.twitter} className="text-gray-400 hover:text-white mx-2">
                            <XIcon/>
                        </a>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div className="flex-1 flex flex-col items-center mx-auto">
                    <h2 className="font-semibold text-lg mb-4">Quick Links</h2>
                    <ul className="space-y-2">
                        <li><Link href="/aboutus" className="text-gray-400 hover:text-white">About Us</Link></li>
                        <li><Link href="/menu" className="text-gray-400 hover:text-white">Menu</Link></li>
                        <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                        <li><Link href="/contactus" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Opening Hours Section */}
                <div className="flex-1 flex flex-col items-center mx-auto">
                    <h2 className="font-semibold text-lg mb-4">Opening Hours</h2>
                    <ul className="space-y-2">
                        {openingHours?.map((day, index) => (
                            <li key={index} className="text-gray-400">
                                {day.day}: {new Date(day.openHour).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - {new Date(day.closeHour).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg mb-4">Make your reservation now</h2>
                    <p className="font-semibold text-cyan-700">
                        {config?.name}
                        <br/><br/>
                        {config?.contact.address}
                        <br/><br/>
                        {config?.contact.telephone}
                    </p>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
                <p>Copyright © 2024 Senol Kaçar All Rights Reserved.</p>
            </div>
        </footer>
    );
}