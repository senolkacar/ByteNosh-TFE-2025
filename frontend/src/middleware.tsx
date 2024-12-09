import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import { DEFAULT_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes, adminRoutes } from "@/routes";

export const { auth } = NextAuth(authConfig);

export default auth(async(req) => {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const isAuthenticated = !!req.auth;
    const userRole = token?.role;
    const isAdmin = userRole === "ADMIN";
    const { nextUrl } = req;
    if (nextUrl.pathname === "/debug-auth") {
        return new Response(JSON.stringify({ auth: req.auth, token }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
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
        if (isAuthenticated) {
            return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        } else if (nextUrl.pathname === "/auth/login") {
            return;
        }
        return;
    }

    if (isAdminRoute) {
        if (!isAdmin) {
            return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        }
    }

    if (!isPublicRoute && !isAuthenticated) {
        return Response.redirect(new URL("/auth/login", nextUrl));
    }

    return;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/error).*)"],
};