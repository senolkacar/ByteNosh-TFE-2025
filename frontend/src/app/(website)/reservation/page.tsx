"use client";
import { useState } from "react";
import ReservationSettings from "@/app/components/reservation/reservation-settings";
import TableDisplay from "@/app/components/reservation/table-display";
import { AnimatePresence } from "framer-motion";

export default function ReservationPage() {
    const [currentStep, setCurrentStep] = useState<"dateSelection" | "tableSelection">("dateSelection");
    const [reservationData, setReservationData] = useState<{ date: Date | null; timeSlot: string | null }>({ date: null, timeSlot: null });

    const handleCheckAvailability = (date: Date, timeSlot: string) => {
        setReservationData({ date, timeSlot });
        setCurrentStep("tableSelection");
    };

    const handleBack = () => {
        setCurrentStep("dateSelection");
    };

    return (
        <div className="relative h-screen">
            <AnimatePresence mode="wait">
                {currentStep === "dateSelection" ? (
                    <ReservationSettings
                        key="dateSelection"
                        onCheckAvailability={handleCheckAvailability}
                    />
                ) : (
                    <TableDisplay
                        key="tableSelection"
                        date={reservationData.date}
                        timeSlot={reservationData.timeSlot}
                        onBack={handleBack}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
