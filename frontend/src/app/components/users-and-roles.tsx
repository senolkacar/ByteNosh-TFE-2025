"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import toast,{Toaster} from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const schema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(6,"Password must be at least 6 characters"),
    role: z.string()
});


export default function UsersAndRoles() {
    const [user, setUser] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            role: 'USER', // Default role
        },
    });
    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting, isDirty, isValid }
    } = form;

    const searchUserByEmail = async (email: string) => {
        try {
            const res = await fetch(`/api/user/${email}`);
            if (res.ok) {
                const foundUser = await res.json();
                setUser(foundUser);
                // Auto-fill form with user data
                setValue("fullName", foundUser.fullName);
                setValue("email", foundUser.email);
                setValue("phone", foundUser.phone || "");
                setValue("role", foundUser.role || "USER");
                toast.success("User found and form populated!");
            } else {
                toast.error("User not found.");
                setUser(null); // Reset user if not found
            }
        } catch (error) {
            toast.error("Error fetching user.");
        }
    };

    const onSubmit = async(data: any)=> {
        const url = '/api/update-user';
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Error updating/creating user.');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Full Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter your full name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Email"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => searchUserByEmail(field.value)}
                                    >
                                        Search User
                                    </Button>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Enter the user's email to search.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="Phone" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter your phone number.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="Password" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter your password.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role">
                                            {field.value || "USER"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Select desired role for the user.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}
                >
                    Submit
                </Button>
                <Toaster />
            </form>

        </Form>

);
}