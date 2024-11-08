"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
    const orders = [
        {
            id: "001",
            status: "Completed",
            date: "2024-08-01",
            amount: "$120.00",
        },
        {
            id: "002",
            status: "Pending",
            date: "2024-08-05",
            amount: "$75.00",
        },
        {
            id: "003",
            status: "Cancelled",
            date: "2024-08-10",
            amount: "$45.00",
        },
    ];

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                        Here is a list of your recent orders and their statuses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === "Completed"
                                                ? "secondary"
                                                : order.status === "Pending"
                                                    ? "outline"
                                                    : "destructive"
                                        }>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell className="text-right">
                                        {order.amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button asChild className="mt-4">
                        <Link href="#">
                            View All Orders <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
