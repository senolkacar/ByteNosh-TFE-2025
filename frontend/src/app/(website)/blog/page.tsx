"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Button} from "@/components/ui/button";
type Post = {
    _id: string;
    title: string;
    body: string;
    author: string;
};



export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch('http://localhost:5000/api/posts');
            const data = await response.json();
            setPosts(data);
        }
        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Latest Blog Posts</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Card key={post._id} className="shadow-lg">
                        <CardHeader>
                            <CardTitle>{post.title}</CardTitle>
                            <Badge className="ml-2" variant="outline">{post.author}</Badge>
                        </CardHeader>
                        <CardContent>
                            <p>{post.body.substring(0, 150)}...</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link">Read More</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}