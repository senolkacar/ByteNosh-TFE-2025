"use client";
import Image from 'next/image';
import {useSession} from "next-auth/react";
import {RegisterButton} from "@/components/auth/register-button";
import Config from "@/app/models/config";
import {useEffect, useState} from "react";

export default function HomeHero() {
    const [config, setConfig] = useState<Config>();
    useEffect(() => {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => setConfig(data))
            .catch(error => console.error('Error fetching config:', error));
    }, []);
    const {data: session,status} = useSession();
    return (
        <div className="bg-amber-50 px-4 py-24">
        <section className="mx-auto max-w-screen-xl p-8">
            <div className="flex flex-col items-center md:grid grid-cols-2">
            <div className="py-12 col-span-1">
                <h1 className="text-center text-6xl font-semibold md:text-left">
                    Welcome to {config?.name}
                </h1>
                <p className="text-lg mt-4 text-gray-500">
                    {config?.slogan}
                </p>
                <div className="flex items-center mt-6 md:mt-4">
                    <button className="bg-yellow-400 font-bold px-6 py-4 rounded-full">Reservation</button>
                    {!session && status !== 'loading' ? (
                        <RegisterButton>
                            <button className="bg-white ml-4 font-bold px-6 py-4 rounded-full border hover:text-indigo-600">Sign Up</button>
                        </RegisterButton>
                    ) : ("")}
                </div>
            </div>
            <div className="col-span-1 relative">
                <Image src="http://localhost:5000/images/food.png" alt="food" height="450" width="450"/>
            </div>
            </div>
        </section>
        </div>
    );
}