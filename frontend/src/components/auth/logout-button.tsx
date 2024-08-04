"use client";
import {useRouter} from "next/navigation";
import React from "react";
import {signOut} from "next-auth/react";

interface LogOutButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect",
    asChild?: boolean;
}

export const LogOutButton = ({
                                children,
                                mode = "redirect",
                                asChild
                            }: LogOutButtonProps) => {
    const router = useRouter();
    const onClick = () => {
        signOut({redirect: false});
        router.push("/");
    }
    return (
        <span onClick={onClick} className="cursor-pointer">
        {children}
        </span>
    );

}