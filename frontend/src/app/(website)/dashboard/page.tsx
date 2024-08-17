"use client";

import {DashboardScreen} from "@/app/components/dashboard";

export default function Dashboard() {
    return (
        <>
            <div className="flex max-w-screen-xl pt-32">

                    <div className="flex-grow p-4">
                        <DashboardScreen/>
                    </div>
            </div>
        </>
    )
}