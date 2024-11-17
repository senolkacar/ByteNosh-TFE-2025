'use client';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Swiper, SwiperSlide} from "swiper/react";
import { Navigation,Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from "next/link";
import DownloadApp from "@/app/components/home/downloadapp";
import Footer from "@/app/components/home/footer";
import {useEffect, useState} from "react";
import Image from "next/image";

export default function HomeMenu() {
    const [items,setItems] = useState<any[]>([]);
    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3,
            slidesToSlide: 3 // optional, default to 1.
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
            slidesToSlide: 2 // optional, default to 1.
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1 // optional, default to 1.
        }
    };

    useEffect(() => {
        fetch('/api/orders/most-ordered')
            .then(response => response.json())
            .then(data => setItems(data))
            .catch(error => console.error('Error fetching config:', error));
    }, []);
    return (
        <section className="m-4 mx-auto max-w-screen-xl ">
            <div className="mt-10 pl-4">
                <div className="flex justify-between">
                <h2 className="text-5xl font-extrabold ">Most popular dishes</h2>
                    <Link href="/menu">
                        <button className="bg-yellow-400 font-bold px-6 py-2 mr-4"><ListAltIcon/> Full Menu</button>
                    </Link>
                </div>
                <p className="text-lg mt-4 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={5}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                        spaceBetween: 4,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 4,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 5,
                    },

                }}
                >
                {items.map((item, idx) => (
                    <SwiperSlide key={idx}>
                        <div
                            className="bg-gray-50 m-4 p-3 rounded-lg text-center shadow-md hover:bg-white hover:shadow-md hover:shadow-gray-400 ">
                            <div className="flex justify-center items-center w-20 h-20 mx-auto">
                                <Image
                                    src={`http://localhost:5000/images/${item.image}`}
                                    alt="meal"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                            <h4 className="text-xl font-semibold my-3">{item.name}</h4>
                            <p className="text-gray-500">Description of the food</p>

                            <div className="flex justify-center items-center gap-12 mt-4">
                                <p className="font-semibold text-2xl">{item.price}€</p>
                                <Link href="/menu">
                                    <button className="bg-yellow-400 font-bold px-6 py-2">More</button>
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}

            </Swiper>
            <DownloadApp/>
            <Footer/>
        </section>
    );
}