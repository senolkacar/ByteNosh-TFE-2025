"use client";
import Link from "next/link"
import {useState} from "react";
import SiteConfiguration from "@/app/components/panel/site-configuration";
import UsersAndRoles from "@/app/components/panel/users-and-roles";
import MenuManagement from "@/app/components/panel/menu-management";
import BlogPost from "@/app/components/panel/blogpost";
import OpeningHoursConfig from "@/app/components/panel/oppening-hours";
import SectionAndTables from "@/app/components/panel/section-and-tables";
import Reservations from "@/app/components/panel/reservations";
import Waitlist from "@/app/components/panel/waitlist";


export default function Panel() {
    const [selectedLink, setSelectedLink ] = useState("SiteConfiguration");
    const renderContent = () => {
        switch (selectedLink) {
            case "SiteConfiguration":
                return <SiteConfiguration />;
            case "UsersAndRoles":
                return <UsersAndRoles />;
            case "MenuManagement":
                return <MenuManagement />;
            case "BlogPosts":
                return <BlogPost />;
            case "OpeningHours":
                return <OpeningHoursConfig />;
            case "SectionsAndTables":
                return <SectionAndTables />;
            case "Reservations":
                return <Reservations />;
            case "Waitlist":
                return <Waitlist />;
            default:
                return <SiteConfiguration />;
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
                        <Link href="#" onClick={() => setSelectedLink("OpeningHours")} className={`${selectedLink === "OpeningHours" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Opening Hours
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("SectionsAndTables")} className={`${selectedLink === "SectionsAndTables" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Sections & Tables
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("Reservations")} className={`${selectedLink === "Reservations" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Reservations
                        </Link>
                        <Link href="#" onClick={() => setSelectedLink("Waitlist")} className={`${selectedLink === "Waitlist" ? "font-bold bg-gray-200 rounded" : ""} text-primary hover:text-cyan-700`}>
                            Waitlist
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
