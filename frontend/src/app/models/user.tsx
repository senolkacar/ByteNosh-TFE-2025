export default interface User {
    id: string,
    fullName: string,
    email: string,
    phone: string,
    avatar: string,
    password: string,
    role: "ADMIN" | "USER" | "EMPLOYEE",
    orders: string[],
    refreshToken?: string; // Current valid refresh token
    refreshTokenExpiresAt?: Date; // Expiry of the current refresh token
    replacedByToken?: string;
}