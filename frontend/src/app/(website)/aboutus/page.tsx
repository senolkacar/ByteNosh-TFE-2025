"use client";

import MainTitle from "@/app/components/home/maintitle";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import {useEffect, useState} from "react";
import Config from "@/app/models/config";
import Image from "next/image";

export default function AboutUs() {
    const [config, setConfig] = useState<Config>();
    useEffect(() => {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => setConfig(data))
            .catch(error => console.error('Error fetching config:', error));
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return (
        <>
        <MainTitle title={"About Us"} description={"Learn more about us"} linkText={"Home"} linkUrl={"/"}/>
        <div className="container mt-6 p-8">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-3">
                    <Image
                        src="http://localhost:5000/images/waitress.jpg"
                        alt="About us"
                        width={600}
                        height={300}
                        className="object-contain"
                    />
                </div>
                <div className="flex-1">
                    <h2 className="text-6xl font-semibold mb-3 ml-4">{config?.aboutUs.title1}</h2>
                    <p className="font-light ml-4">{config?.aboutUs.description1}</p>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row mt-20">
                <div className="flex-1">
                    <h2
                        className="text-6xl font-semibold mb-3 ml-4"
                        dangerouslySetInnerHTML={{ __html: (config?.aboutUs.title2 ?? '').replace(/\n/g, '<br />') }}
                    ></h2>
                    <p className="font-light ml-4">{config?.aboutUs.description2}</p>
                    <button onClick={openModal} className="bg-yellow-400 font-bold px-4 py-2 mr-4 ml-4 mt-3 mb-3"><PlayArrowIcon/> Promo video</button>
                </div>
                <div className="flex-1 relative">
                    <Image fill={true}  src="http://localhost:5000/images/promovideo.jpg" alt="Promo video" className="mx-auto"/>
                    <button onClick={openModal} className="absolute inset-0 flex items-center justify-center">
                        <PlayArrowIcon className="text-white text-6xl"/>
                    </button>
                </div>
            </div>
        </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-200 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="relative bg-white p-4 rounded-lg">
                        <button onClick={closeModal} className="absolute top-4 right-4">
                            <CloseIcon className="text-white"/>
                        </button>
                        <iframe
                            width="560"
                            height="315"
                            src={config?.aboutUs.video as string}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </>
    );
}