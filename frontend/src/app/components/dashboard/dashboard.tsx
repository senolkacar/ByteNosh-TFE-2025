import React, { useState } from "react";
import Link from "next/link";
import { Menu, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {ClientDashboard} from "@/app/components/dashboard/client-dashboard";
import Profile from "@/app/components/dashboard/profile";
import ReservationsPage from "@/app/components/dashboard/reservations";
import SettingsPage from "@/app/components/dashboard/settings";
import { useActiveSection } from "@/app/context/activesectioncontext";


export function DashboardScreen() {
    const { activeSection, setActiveSection } = useActiveSection();


    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                        onClick={() => setActiveSection("Dashboard")}
                    >
                        <Package2 className="h-6 w-6" />
                        <span className="sr-only">Acme Inc</span>
                    </Link>
                    <button
                        className={`text-foreground transition-colors hover:text-foreground ${activeSection === "Dashboard" ? "font-bold" : "text-muted-foreground"}`}
                        onClick={() => setActiveSection("Dashboard")}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`text-foreground transition-colors hover:text-foreground ${activeSection === "Profile" ? "font-bold" : "text-muted-foreground"}`}
                        onClick={() => setActiveSection("Profile")}
                    >
                        Profile
                    </button>
                    <button
                        className={`text-foreground transition-colors hover:text-foreground ${activeSection === "Reservations" ? "font-bold" : "text-muted-foreground"}`}
                        onClick={() => setActiveSection("Reservations")}
                    >
                        Reservations
                    </button>
                    <button
                        className={`text-foreground transition-colors hover:text-foreground ${activeSection === "Settings" ? "font-bold" : "text-muted-foreground"}`}
                        onClick={() => setActiveSection("Settings")}
                    >
                        Settings
                    </button>
                </nav>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetTitle>Menu</SheetTitle>
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link
                                href="#"
                                className="flex items-center gap-2 text-lg font-semibold"
                                onClick={() => setActiveSection("Dashboard")}
                            >
                                <Package2 className="h-6 w-6" />
                                <span className="sr-only">Acme Inc</span>
                            </Link>
                            <button
                                className={`hover:text-foreground ${activeSection === "Dashboard" ? "font-bold" : "text-muted-foreground"}`}
                                onClick={() => setActiveSection("Dashboard")}
                            >
                                Dashboard
                            </button>
                            <button
                                className={`hover:text-foreground ${activeSection === "Profile" ? "font-bold" : "text-muted-foreground"}`}
                                onClick={() => setActiveSection("Profile")}
                            >
                                Profile
                            </button>
                            <button
                                className={`hover:text-foreground ${activeSection === "Reservations" ? "font-bold" : "text-muted-foreground"}`}
                                onClick={() => setActiveSection("Reservations")}
                            >
                                Reservations
                            </button>
                            <button
                                className={`hover:text-foreground ${activeSection === "Settings" ? "font-bold" : "text-muted-foreground"}`}
                                onClick={() => setActiveSection("Settings")}
                            >
                                Settings
                            </button>
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {activeSection === "Dashboard" && <ClientDashboard setActiveSection={setActiveSection} />}
                {activeSection === "Profile" && <Profile />}
                {activeSection === "Reservations" && <ReservationsPage />}
                {activeSection === "Settings" && <SettingsPage />}
            </main>
        </div>
    );
}