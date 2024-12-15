import NextAuth from "next-auth";
import { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import clientPromise from "@/lib/db";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { Adapter } from "next-auth/adapters";
import authConfig from "@/auth.config";
import {ZodError} from "zod";
import { JWT } from "@auth/core/jwt";
import {jwtDecode, JwtPayload } from "jwt-decode";

const refreshAccessToken = async (refreshToken: string) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/auth-backend/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Failed to refresh access token");
        }

        const refreshedTokens = await response.json();
        return {
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken, // Update refresh token
        };
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const authOptions: NextAuthConfig = {
    adapter: MongoDBAdapter(clientPromise) as Adapter,
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
                        console.error("No credentials provided");
                        return null;
                    }

                    const { email, password } = credentials;
                    try {
                        const res = await fetch(`${apiBaseUrl}/api/auth-backend/login`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email, password }),
                        });

                        const data = await res.json();
                        //console.log("Login API Response:", data);

                        if (res.status !== 200) {
                            console.error("Login API Error:", res.status, data);
                            return null;
                        }

                        const { user, accessToken, refreshToken } = data;

                        if (!user || !accessToken) {
                            console.error("Missing user or accessToken in response");
                            return null;
                        }

                        // Return the user object with accessToken and refreshToken for NextAuth
                        return { ...user, id: user._id, accessToken, refreshToken };
                    } catch (error) {
                        console.error("Error in authorize function:", error);
                        if (error instanceof ZodError) {
                            console.error("Zod validation error:", error.errors);
                        }
                        return null;
                    }
                },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    pages:{
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: any }) {
            if (user) {
                token.id = user.id;
                token.fullName = user.fullName;
                token.phone = user.phone;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }

            // Check if the access token is expired
            if (token.accessToken) {
                const decodedToken = jwtDecode<JwtPayload>(token.accessToken as string);
                const currentTime = Math.floor(Date.now() / 1000);

                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log("Access token expired. Attempting to refresh...");

                    const refreshedTokens = await refreshAccessToken(token.refreshToken as string);

                    if (refreshedTokens) {
                        token.accessToken = refreshedTokens.accessToken;
                        token.refreshToken = refreshedTokens.refreshToken;
                    } else {
                        console.error("Failed to refresh access token. User must log in again.");
                        return {}; // Clear token to force logout
                    }
                }
            }

            return token;
        },

        async session({ session, token }: { session: any; token: JWT }) {
            if (!token?.accessToken) {
                console.log("Session expired. Logging out.");
                return null; // Force logout
            }
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id,
                    fullName: token.fullName,
                    phone: token.phone,
                    role: token.role,
                };
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },

};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);