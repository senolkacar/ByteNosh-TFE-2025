"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import toast, {Toaster} from "react-hot-toast";
import {Input} from "@/components/ui/input";
import {useState} from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const schema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    role: z.string()
});


export default function UsersAndRoles() {
    const [user, setUser] = useState<any>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            role: 'USER', // Default role
        },
    });

    const {
        register,
        handleSubmit,
        setValue
    } = form;

    const searchUserByEmail = async (email: string) => {
        try {
            const res = await fetch(`/api/user/${email}`);
            if (res.ok) {
                return await res.json();
            } else {
                setUser(null); // Reset user if not found
            }
        } catch (error) {
            toast.error("Error fetching user.");
        }
    };

    const handleSearchUser = async (email: string) => {
        const user = await searchUserByEmail(email);
        if (user) {
            setUser(user);
            setValue('fullName', user.fullName);
            setValue('phone', user.phone);
            setValue('email', user.email);
            setValue('role', user.role);
            toast.success("User found, form filled with user details.");
        } else {
            toast.error("User not found.");
        }
    };

    const onSubmit = async (data: any) => {
        const user = await searchUserByEmail(data.email);

        if (user) {
            setFormData(data);
            setShowDialog(true);
        } else {
            await updateUser(data);
        }
    };

    const updateUser = async (data: any) => {
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
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h3 className="text-lg font-semibold">Create user by filling the form or edit an existing user by searching via mail</h3>
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
                                            onClick={() => handleSearchUser(field.value)}
                                        >
                                            Search User
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Enter the user's email to search for, or to add a new user.
                                    <br />
                                    <span className="text-lg font-semibold text-red-600">Attention ! When creating a new user the password generated will be send to this email ensure that you provide a correct email address.</span>
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

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            User with email {formData?.email} already exists, do you want to update the user?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            updateUser(formData);
                            setShowDialog(false);
                        }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}