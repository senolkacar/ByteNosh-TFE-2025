import NextAuth from "next-auth";
import { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import Google from "@auth/core/providers/google";
import clientPromise from "@/lib/db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import authConfig from "@/auth.config";
import {signInSchema} from "@/lib/zod";

const authOptions: NextAuthConfig = {
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials, request) => {
                if (!credentials) {
                    console.error('No credentials provided');
                    return null;
                }

                const { email, password } = credentials;
                try {
                    const res = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({email, password}),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.message || 'Login failed');
                    }

                    const { user, token } = data;

                    if (!user || !token) {
                        throw new Error('Invalid response from server');
                    }

                    return { ...user, token };
                } catch (error) {
                    if (error instanceof Error) {
                        console.error('Error in authorize function:', error.message);
                        throw new Error(error.message);
                    } else {
                        console.error('Unexpected error in authorize function:', error);
                        throw new Error('Unexpected error occurred');
                    }
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
};
//TODO: IMPLEMENT SESSION MANAGEMENT
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);