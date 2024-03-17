'use client';

import {useEffect, useState} from "react";
import {format} from "date-fns";

interface Table {
    _id: string;
    name: string;
    seats: number;
    available: boolean;
}

interface Order {
    _id: string;
    table: string;
    meals: string[];
    date: Date;
    status: string;

}

export default function POS(){

    const [tables, setTables] = useState<Table[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    useEffect(() => {
        fetch('http://localhost:5000/api/tables')
            .then(response => response.json())
            .then((data:Table[])=> setTables(data))
            .catch(error => console.error('Error:', error));
    }, []);
    useEffect(() => {
        fetch('http://localhost:5000/api/orders')
            .then(response => response.json())
            .then((data:Order[])=> setOrders(data))
            .catch(error => console.error('Error:', error));
    }, []);
    return (
        <div className="bg-white px-8 h-screen pl-72">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="mt-2 text-6xl font-bold tracking-light text-gray-900">TABLES</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {tables.map((table, index) => {
                    const relatedOrders = orders.filter(order => order.table === table._id);
                    return (
                        <div key={index} className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center flex-col">
                            <p className="text-2xl font-bold text-gray-700">{table.name}</p>
                            <div className="flex items-center flex-col">
                                <p className="text-gray-500">Seats: {table.seats}</p>
                                <p className="text-gray-500">Status: {table.available ? "Available" : "Not Available"}</p>
                                <div className="flex items-center flex-col">
                                    {relatedOrders.map((order, orderIndex) => (
                                        <div key={orderIndex} className="flex items-center flex-col">
                                            <p className="text-gray-500 font-semibold">OrderID:</p> <p className="text-gray-500">{order._id}</p>
                                            <p className="text-gray-500 font-semibold">Date:</p> <p className="text-gray-500">{format(new Date(order.date),'dd/MM/yyyy, hh:mm:ss')}</p>
                                                <p className="text-gray-500 font-semibold">Status:</p> <p className="text-gray-500">{order.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
