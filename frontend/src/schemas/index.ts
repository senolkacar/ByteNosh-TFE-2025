import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string({
        message: "Please enter a valid password"
    })
})


export const RegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(1, "Name is required"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim().min(6, "Password must be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});