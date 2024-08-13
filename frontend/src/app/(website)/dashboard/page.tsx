"use client";

import {DashboardMenu} from "@/app/components/dashboard-home";

export default function Dashboard() {
    return (
        <>
            <div className="flex max-w-screen-xl pt-32">

                    <div className="flex-grow p-4">
                        <DashboardMenu/>
                    </div>
            </div>
        </>
    )
}