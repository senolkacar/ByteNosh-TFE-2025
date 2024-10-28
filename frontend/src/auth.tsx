import NextAuth, {DefaultSession, Session, User} from "next-auth";
import { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import Google from "@auth/core/providers/google";
import clientPromise from "@/lib/db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import authConfig from "@/auth.config";
import {signInSchema} from "@/lib/zod";
import {ZodError} from "zod";
import {JWT} from "@auth/core/jwt";


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
                    if (res.status !== 200) {
                        return null;
                    }

                    const { user, token } = data;

                    if (!user || !token) {
                        return null;
                    }

                    return { ...user, token };
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    pages:{
        signIn: "/auth/login",
    },
    callbacks: {
        // Adding custom fields to the JWT token
        jwt({ token, user }: { token: JWT; user?: any }) {
            if (user) {
                token.id = user.id;
                token.fullName = user.fullName;
                token.phone = user.phone;
                token.role = user.role;
            }
            return token;
        },
        // Including custom fields in the session object
        session({ session, token }: { session: any; token: JWT }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id,
                    fullName: token.fullName,
                    phone: token.phone,
                    role: token.role,
                };
            }
            return session;
        },
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);