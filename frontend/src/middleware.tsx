import { getToken } from "next-auth/jwt";
import {DEFAULT_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes, adminRoutes} from "@/routes";


export default async function middleware(req:any) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    const { nextUrl } = req;
    const isLoggedIn = !!token;
    const userRole = token?.role;
    const isAdmin = userRole === "ADMIN";
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.some((route) => {
        if (typeof route === "string") {
            return nextUrl.pathname === route;
        } else {
            return route.test(nextUrl.pathname);
        }
    });
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isAdminRoute = adminRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        } else if (nextUrl.pathname === "/auth/login") {
            return;
        }
    return ;
    }

    if (isAdminRoute) {
        if (!isAdmin) {
            return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        }
    }

    if (!isPublicRoute && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", nextUrl));
    }

    return;
};

export const config = {
    matcher: ['/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)']
};