"use client";
import Link from "next/link"
import {useState} from "react";
import SiteManagement from "@/app/components/site-management";
import UsersAndRoles from "@/app/components/users-and-roles";
import MenuManagement from "@/app/components/menu-management";
import BlogPost from "@/app/components/blogpost";
import ReservationSettings from "@/app/components/reservation";



export default function Panel() {
    const [selectedLink, setSelectedLink ] = useState("SiteConfiguration");
    const renderContent = () => {
        switch (selectedLink) {
            case "SiteConfiguration":
                return <SiteManagement />;
            case "UsersAndRoles":
                return <UsersAndRoles />;
            case "MenuManagement":
                return <MenuManagement />;
            case "BlogPosts":
                return <BlogPost />;
            case "ReservationSettings":
                return <ReservationSettings />;
            default:
                return <SiteManagement />;
        }
    };
    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 mt-32 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav
                        className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
                    >
                        <Link href="#" onClick={() => setSelectedLink("SiteConfiguration")} className={`${selectedLink === "SiteConfiguration" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Website Configuration
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("UsersAndRoles")} className={`${selectedLink === "UsersAndRoles" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Users & Roles
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("MenuManagement")} className={`${selectedLink === "MenuManagement" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Menu Management
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("BlogPosts")} className={`${selectedLink === "BlogPosts" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Blog & Posts
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("ReservationSettings")} className={`${selectedLink === "ReservationSettings" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Reservation Settings
                        </Link>
                    </nav>
                    <div className="grid gap-6">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    )
}
