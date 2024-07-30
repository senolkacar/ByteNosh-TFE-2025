"use client";
import React, {useEffect, useState, useTransition} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {LoginSchema} from "@/schemas";
import {Input} from "@/components/ui/input";
import {signIn} from "next-auth/react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {FormError} from "@/components/form-error";
import {FormSuccess} from "@/components/form-success";
import Link from "next/link";
import {DEFAULT_REDIRECT} from "@/routes";
import {AuthError} from "next-auth";

export default function Login() {
    const [error,setError] = useState<string | undefined>("");
    const [success,setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (values:z.infer<typeof LoginSchema>) => {
        setError('');
        setSuccess('');

        const { email, password } = values;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirectTo: DEFAULT_REDIRECT,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess('Login successful');
            }
        } catch (error) {
            setError('Something went wrong');
        }
    };

    return (
        <div className="bg-amber-50 px-4 py-24 pb-4">
            <section className="mx-auto max-w-screen-xl p-9">
                <div className="bg-grey-lighter min-h-screen flex flex-col">
                    <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
                        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                            <h1 className="mb-8 text-3xl text-center">Log In</h1>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field })=>(
                                            <FormItem>
                                                <FormLabel>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="enter your mail"
                                                        type="email"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                    )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field })=>(
                                                <FormItem>
                                                    <FormLabel>
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormError message={error}/>
                                    <FormSuccess message={success}/>
                                    <Button
                                    type="submit" className="w-full py-3 px-6">
                                        Login
                                    </Button>
                                </form>
                            </Form>
                        </div>
                        <Link href="/auth/register">
                            Dont have account ? Please register.
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}