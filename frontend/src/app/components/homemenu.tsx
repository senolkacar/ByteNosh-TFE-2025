'use client';
import MenuItem from "@/app/components/menuitem";
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Swiper, SwiperSlide} from "swiper/react";
import { Navigation,Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from "next/link";

export default function HomeMenu() {
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

                <SwiperSlide>
                    <MenuItem/>
                </SwiperSlide>
                <SwiperSlide>
                    <MenuItem/>
                </SwiperSlide>
                <SwiperSlide>
                    <MenuItem/>
                </SwiperSlide>
                <SwiperSlide>
                    <MenuItem/>
                </SwiperSlide>
                <SwiperSlide>
                    <MenuItem/>
                </SwiperSlide>

            </Swiper>
        </section>
    );
}