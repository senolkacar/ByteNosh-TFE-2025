"use client";

import Quill from "@/app/components/quill";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Post from "@/app/models/post";
import toast,{Toaster} from "react-hot-toast";


// Define the schema with Zod
const postSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    body: z.string().min(3, "Body must be at least 3 characters"),
});

export default function BlogPost() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

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
        if(editingPost){
            try {
                const response = await fetch(`/api/posts/${editingPost._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (response.ok) {
                    form.reset();
                    setPosts((posts) =>
                        posts.map((post) =>
                            post._id === editingPost._id ? { ...post, ...data } : post
                        )
                    );
                    setEditingPost(null);
                    toast.success("Post updated successfully");
                }
            } catch (error) {
                console.error("Failed to update post", error);
                toast.error("Failed to update post");
            }
            return;
        }else{
            try {
                const user = session?.user?.fullName;
                const post = { ...data, author: user };
                const response = await fetch("/api/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(post),
                });
                if (response.ok) {
                    form.reset();
                    setPosts([]); // Resetting posts
                    toast.success("Post submitted successfully");
                }
            } catch (error) {
                console.error("Failed to submit post", error);
                toast.error("Failed to submit post");
            }
        }
    };

    const handleEditPost = (post: Post) => {
        form.setValue("title", post.title);
        form.setValue("body", post.body);
        setEditingPost(post);
    };

    const handleDeletePost = async (id: string) => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setPosts((posts) => posts.filter((post) => post._id !== id));
                toast.success("Post deleted successfully");
            }
        } catch (error) {
            console.error("Failed to delete post", error);
            toast.error("Failed to delete post");
        }
    };

    return (
        <div>
            <h1>Manage your blog posts</h1>
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
                                           <Quill
                                            value={field.value}
                                            onChange={field.onChange}
                                           />
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

                    <Button type="submit"
                            disabled={!form.formState.isDirty || !form.formState.isValid}
                    >Submit Post</Button>
                </form>
            </Form>

            {/* Displaying Existing Posts */}
            <Table>
                <TableCaption>Existing Posts</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post._id}>
                            <TableCell>{post.title}</TableCell>
                            <TableCell>{post.author}</TableCell>
                            <TableCell>
                                <Button
                                    className="mx-1"
                                    type="button"
                                    onClick={() => handleEditPost(post)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleDeletePost(post._id)}
                                    variant="destructive"
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Toaster/>
        </div>
    );
}
