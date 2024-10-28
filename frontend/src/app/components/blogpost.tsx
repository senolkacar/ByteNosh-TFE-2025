"use client";

import Quill from "@/app/components/quill";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
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
import Post from "@/app/models/post";

// Define the schema with Zod
const postSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    body: z.string().min(3, "Body must be at least 3 characters"),
});

export default function BlogPost() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch("/api/posts");
                const posts = await response.json();
                setPosts(posts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            }
        }
        fetchPosts();
    }, []);

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            body: "",
        },
    });

    const onSubmit = async (data: { title: string; body: string }) => {
        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                form.reset();
                setPosts([]); // Resetting posts
            }
        } catch (error) {
            console.error("Failed to submit post", error);
        }
    };

    return (
        <div>
            <h1>Blog Post</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Title Field */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Blog Title" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Enter a title for your blog post
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Body Field */}
                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Body</FormLabel>
                                <FormControl>
                                    <Controller
                                        control={form.control}
                                        name="body"
                                        render={({ field }) => (
                                           <Quill/>
                                        )}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Enter the content of your blog post
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit Post</Button>
                </form>
            </Form>

            {/* Displaying Existing Posts */}
            <div>
                <h2>Existing Posts</h2>
                {posts.map((post) => (
                    <div key={post._id}>
                        <h3>{post.title}</h3>
                        <div dangerouslySetInnerHTML={{ __html: post.body }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
