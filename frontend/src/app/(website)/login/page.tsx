"use client";
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from './validationschema';

type FormValues = {
    email: string;
    password: string;
};

export default function Login() {
    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(loginSchema),
    });

    const emailValue = watch('email', ''); // Provide a default value

    useEffect(() => {
        if (emailValue && emailValue.length >= 3 && !/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(emailValue)) {
            setError('email', {
                type: 'manual',
                message: 'Invalid email format',
            });
        } else {
            clearErrors('email');
        }
    }, [emailValue, setError, clearErrors]);

    const onSubmit: SubmitHandler<FormValues> = async data => {
        try {
            const response = await fetch('api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            console.log('Login successful', responseData);
            // Store the token in local storage or context
            localStorage.setItem('token', responseData.token);
        } catch (error) {
            console.error('Login error', error);
            // Set errors based on response from backend
            setError('email', { type: 'manual', message: (error as Error).message });
            setError('password', { type: 'manual', message: (error as Error).message });
        }
    };

    return (
        <div className="bg-amber-50 px-4 py-24 pb-4">
            <section className="mx-auto max-w-screen-xl p-9">
                <div className="bg-grey-lighter min-h-screen flex flex-col">
                    <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
                        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                            <h1 className="mb-8 text-3xl text-center">Log In</h1>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div>
                                    <input
                                        type="text"
                                        className={`block border border-grey-light w-full p-3 rounded mb-4 ${errors.email ? 'border-red-500' : ''}`}
                                        {...register('email')}
                                        placeholder="Email"
                                    />
                                    {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        className={`block border border-grey-light w-full p-3 rounded mb-4 ${errors.password ? 'border-red-500' : ''}`}
                                        {...register('password')}
                                        placeholder="Password"
                                    />
                                    {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full text-center py-3 rounded bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none my-1"
                                >
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
