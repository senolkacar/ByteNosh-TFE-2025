"use client";

import {useEffect, useState} from "react";
import Config from "@/app/models/config";
import Image from "next/image";

export default function DownloadApp() {
    const [config, setConfig] = useState<Config>();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    useEffect(() => {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => setConfig(data))
            .catch(error => console.error('Error fetching config:', error));
    }, []);
    return (
        <div className="container mt-6">
            <div className="row flex">
                <div className="col-lg-2 align-self-center">
                        <h2 className="text-6xl font-semibold mb-3 ml-4">{config?.mobile.title}</h2>
                        <p className="font-light ml-4">{config?.mobile.description}</p>
                    <div className="flex items-center mt-2">
                        <a href={config?.mobile.googlePlay as string}><Image
                            src={`${apiBaseUrl}/images/playstore.png`} alt="playstore" width="300" height="300"
                            className="transform hover:scale-110 transition duration-300"/></a>
                        <a href={config?.mobile.appStore as string}>
                            <Image src={`${apiBaseUrl}/images/appstore.png`} alt="appstore" width="300" height="300" className="transform hover:scale-110 transition duration-300"/>
                        </a>
                    </div>
                </div>
                <div className="col-lg-6 relative w-full h-auto">
                    <Image src={`${apiBaseUrl}/images/phone.png`} alt="Phone" className="object-contain" fill={true}/>
                </div>
            </div>
        </div>
    );
}