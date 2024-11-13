export const authRoutes = [
    "/auth/login",
    "/auth/register"
];

export const publicRoutes = [
    "/",
    "/api/config",
    "/api/meals",
    "/menu",
    "/blog",
    /^\/blog(\/.*)?$/,
    "/contactus",
    "/aboutus",
    "/api/opening-hours",
    "/api/orders/most-ordered"
];

export const adminRoutes = [
    "/panel",
];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_REDIRECT = "/";