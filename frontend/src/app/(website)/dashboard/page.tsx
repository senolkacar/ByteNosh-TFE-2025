"use client";
import {DashboardScreen} from "@/app/components/dashboard/dashboard";

export default function Dashboard() {
    return (
        <>
            <div className="flex w-full pt-32">
                    <div className="flex-grow p-4">
                        <DashboardScreen/>
                    </div>
            </div>
        </>
    )
}