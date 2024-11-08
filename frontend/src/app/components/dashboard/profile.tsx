"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import User from "@/app/models/user";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast,{Toaster} from "react-hot-toast";

const schema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    avatar: z.string().optional(),
    phone: z.string().optional()
});

export default function Profile() {
    const [user, setUser] = useState<User>();
    const email = useSession().data?.user?.email;
    const userID = useSession().data?.user?.id;

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            avatar: '',
            phone: '',
        },
    });

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`/api/users/${email}`);
                const data = await response.json();
                setUser(data);
                form.reset(data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
        fetchUser();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            const response = await fetch(`/api/users/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                toast.success('Profile updated successfully');
            } else {
                toast.error('Error updating profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                // Save the image filename in your form
                form.setValue('avatar', data.filename);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                {/* Avatar Section */}
                                <FormField
                                    control={form.control}
                                    name="avatar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avatar</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-20 h-20">
                                                        <AvatarImage src={field.value ? `http://localhost:5000/images/${field.value}` : `http://localhost:5000/images/${user?.avatar}`} alt="Avatar" />
                                                        <AvatarFallback>{user ? `${user.fullName.split(' ').pop()?.charAt(0)}${user.fullName.split(' ')[0].charAt(0)}` : ''}</AvatarFallback>
                                                    </Avatar>
                                                    <Input type="file" onChange={e => handleImageUpload(e)} />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Upload a profile avatar.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Separator />

                                {/* Basic Information */}
                                <div>
                                    <h2 className="text-lg font-semibold">Basic Information</h2>
                                    <div className="grid gap-4 mt-4">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input id="name" {...field} />
                                                        </FormControl>
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
                                                            <Input id="email" type="email" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Separator />

                                {/* Contact Details */}
                                <div>
                                    <h2 className="text-lg font-semibold">Contact Details</h2>
                                    <div className="grid gap-4 mt-4">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input id="phone" placeholder="+32 12 34 56" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Separator />

                                {/* Save Changes Button */}
                                <div className="flex justify-end">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Toaster/>
                </form>
            </Form>
        </main>
    );
}