'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from "@/components/ui/alert"
import {Button} from "@/components/ui/button";

interface Closure {
    date: string;
    reason?: string;
}

const ClosureAlert: React.FC = () => {
    const [closures, setClosures] = useState<Closure[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);

    useEffect(() => {
        const hasSeenClosurePopup = (): boolean => {
            return localStorage.getItem('closurePopupShown') === 'true';
        };

        const setClosurePopupShown = (): void => {
            localStorage.setItem('closurePopupShown', 'true');
        };

        const fetchClosures = async () => {
            if (typeof window !== 'undefined' && !hasSeenClosurePopup()) {
                try {
                    const response = await fetch('/api/closures/current-week-closures');
                    const data: Closure[] = await response.json();
                    if (data.length > 0) {
                        setClosures(data);
                        setShowPopup(true);
                        setClosurePopupShown();
                    }
                } catch (error) {
                    console.error('Error fetching closures:', error);
                }
            }
        };

        fetchClosures();
    }, []);

    if (!showPopup) return null;

    return (
        <Alert className="mt-8" title="Important Notice">
            <div className="flex justify-between items-center">
                <p>The restaurant will be closed on the following date(s) this week:</p>
                <Button className="" onClick={() => setShowPopup(false)}>Close</Button>
            </div>
                <ul>
                    {closures.map((closure) => (
                        <li key={closure.date}>
                            {new Date(closure.date).toLocaleDateString()} - {closure.reason || 'No reason provided'}
                        </li>
                    ))}
                </ul>
        </Alert>
);
};

export default ClosureAlert;