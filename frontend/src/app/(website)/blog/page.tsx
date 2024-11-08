"use client";
import React, { useEffect, useState } from 'react';
import MainTitle from "@/app/components/home/maintitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {useRouter} from "next/navigation";
import  Post  from "@/app/models/post";

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch('http://localhost:5000/api/posts');
            const data = await response.json();
            setPosts(data);
        }
        fetchPosts();
    }, []);
    const handleReadMore = (id: string) => {
        router.push(`/blog/${id}`); // Navigate to the post's detailed page
    };

    return (
        <>
            <MainTitle title={"Blog"} description={"Latest Articles"} linkText={"Home"} linkUrl={"/"} />
            <div className="container mx-auto mt-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.map((post) => {
                        const formatDate = new Date(post.date).toLocaleDateString('en-GB');
                        return (
                            <Card key={post._id} className="shadow-md transition-transform transform hover:scale-105">
                                <CardHeader className="p-0">
                                    <img
                                        className="rounded-t-lg object-cover w-full h-64"
                                        src="http://localhost:5000/images/food.png"
                                        alt="food"
                                    />
                                </CardHeader>
                                <CardContent className="h-64 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500">{formatDate} | {post.author}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <CardTitle className="text-xl mt-2 font-semibold">{post.title}</CardTitle>
                                        <Button onClick={()=> handleReadMore(post._id)} variant="outline" className="text-xs bg-amber-400">Read More</Button>
                                    </div>
                                    <CardDescription className="mt-2 text-gray-700" dangerouslySetInnerHTML={{ __html: post.body }} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}