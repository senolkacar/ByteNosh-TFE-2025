"use client";
import MainTitle from "@/app/components/maintitle";
import Sidebar from "@/app/components/sidebar";

export default function Dashboard() {
    return (
        <>
            <div className="flex max-w-screen-xl pt-32">
                    <Sidebar/>
                    <div className="flex-grow p-4">
                        CONTENT HERE
                    </div>
            </div>
        </>
    )
}