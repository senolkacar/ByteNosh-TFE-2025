"use client";
import React, { useEffect, useState } from 'react';
import MainTitle from "@/app/components/home/maintitle";
import { use } from 'react';

type Post = {
    _id: string;
    title: string;
    body: string;
    author: string;
    date: string;
};

interface BlogPostPageProps {
    params: Promise<{ id: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = use(params);
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        async function fetchPost() {
            if (!id) return;
            const response = await fetch(`http://localhost:5000/api/blog/${id}`);
            const data = await response.json();
            setPost(data);
        }
        fetchPost();
    }, [id]);

    if (!post) {
        return <div>Loading...</div>;
    }

    const formatDate = new Date(post.date).toLocaleDateString('en-GB');

    return (
        <>
            <MainTitle title={"Blog"} description={post.title} linkText={"Home"} linkUrl={"/"} />
            <div className="container mx-auto mt-6 p-8">
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1">
                        <img src="http://localhost:5000/images/waitress.jpg" alt="Blog" className="w-3/4 mx-auto"/>
                    </div>
                    <div className="flex-1 mx-auto mt-4">
                        <h1 className="text-3xl font-bold">{post.title}</h1>
                        <p className="text-gray-500">{formatDate} | {post.author}</p>
                        <p className="mt-4" dangerouslySetInnerHTML={{__html: post.body}}/>
                    </div>
                </div>
            </div>
        </>
    );
}
