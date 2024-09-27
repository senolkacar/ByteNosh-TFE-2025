'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveSectionContextType {
    activeSection: string;
    setActiveSection: React.Dispatch<React.SetStateAction<string>>;
}

const ActiveSectionContext = createContext<ActiveSectionContextType | undefined>(undefined);

interface ActiveSectionProviderProps {
    children: ReactNode;
}

export const ActiveSectionProvider = ({ children }: ActiveSectionProviderProps) => {
    const [activeSection, setActiveSection] = useState("Dashboard");

    return (
        <ActiveSectionContext.Provider value={{ activeSection, setActiveSection }}>
            {children}
        </ActiveSectionContext.Provider>
    );
};

export const useActiveSection = () => {
    const context = useContext(ActiveSectionContext);
    if (!context) {
        throw new Error('useActiveSection must be used within an ActiveSectionProvider');
    }
    return context;
};