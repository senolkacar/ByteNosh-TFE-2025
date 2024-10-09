"use client";

import MainTitle from "@/app/components/maintitle";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import {useState} from "react";

export default function AboutUs() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return (
        <>
        <MainTitle title={"About Us"} description={"Learn more about us"} linkText={"Home"} linkUrl={"/"}/>
        <div className="container mt-6 p-8">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-3">
                    <img src="http://localhost:5000/images/waitress.jpg" alt="About us" className="w-3/4 mx-auto"/>
                </div>
                <div className="flex-1">
                    <h2 className="text-6xl font-semibold mb-3 ml-4">We do not cook, we create your emotions!</h2>
                    <p className="font-light ml-4">Faudantium magnam error temporibus ipsam aliquid neque quibusdam dolorum, quia ea numquam assumenda mollitia dolorem impedit. Voluptate at quis exercitationem officia temporibus adipisci quae totam enim dolorum, assumenda. Sapiente soluta nostrum reprehenderit a velit obcaecati facilis vitae magnam tenetur neque vel itaque inventore eaque explicabo commodi maxime! Aliquam quasi, voluptates odio.

                        Consectetur adipisicing elit. Cupiditate nesciunt amet facilis numquam, nam adipisci qui voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem ea laborum.</p>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row mt-20">
                <div className="flex-1">
                    <h2 className="text-6xl font-semibold mb-3 ml-4">Restaurant is like a theater. <br/> Our task is to amaze
                        you!</h2>
                    <p className="font-light ml-4">Consectetur adipisicing elit. Cupiditate nesciunt amet facilis
                        numquam, nam adipisci qui
                        voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem ea
                        laborum.</p>
                    <button onClick={openModal} className="bg-yellow-400 font-bold px-4 py-2 mr-4 ml-4 mt-3 mb-3"><PlayArrowIcon/> Promo video</button>
                </div>
                <div className="flex-1 relative">
                    <img src="http://localhost:5000/images/promovideo.jpg" alt="Promo video" className="mx-auto"/>
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
                            src="https://www.youtube.com/embed/F3zw1Gvn4Mk"
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