"use client";

import { useSession } from "next-auth/react";

export default function DisplayUsername() {
    const { data: session, status } = useSession();

    return (
        <div>
            {status !== 'loading' && session ? (
                <p className="font-light text-gray-500 ml-2">Welcome, <span className="font-semibold"> {session.user?.email}</span></p>
            ) : null}
        </div>
    );
}