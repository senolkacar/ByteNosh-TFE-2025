'use client';
import MenuItem from "@/app/components/menuitem";
import Carousel from "react-multi-carousel";
import 'react-multi-carousel/lib/styles.css';

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
                <h2 className="text-5xl font-extrabold ">Most popular dishes</h2>
                <p className="text-lg mt-4 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            {/*<div className="grid grid-cols-2 mt-4 mr-5 gap-3 md:grid-cols-3">
            <MenuItem/>
            <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
            </div>*/}
            <Carousel
                responsive={responsive}
            >
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
            </Carousel>
        </section>
    );
}