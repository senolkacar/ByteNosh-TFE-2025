'use client';

import {useEffect, useState} from "react";

interface Meal {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    vegetarian: boolean;
    vegan: boolean;
    category: string;
}

export default function TABLET(){
    const [meals, setMeals] = useState<Meal[]>([]);
    useEffect(() => {
        fetch('/api/meals')
            .then(response => response.json())
            .then((data: Meal[]) => setMeals(data)) // Use the Meal type for fetched data
            .catch(error => console.error('Error fetching meals:', error));
    }, []);
    return (
        <div className="bg-white px-8 h-screen pl-72">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="mt-2 text-6xl font-bold tracking-light text-gray-900">TABLET MENU</h2>
            </div>
            <div className="container mt-4 mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map(meal => (
                        <div key={meal._id} className="border rounded-lg overflow-hidden shadow-lg">
                            <img src={meal.image} alt={meal.name} className="w-full h-64 object-cover"/>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-2">{meal.name}</h3>
                                <p className="text-gray-700 text-base mb-4">{meal.description}</p>
                                <p className="text-gray-900 font-bold">€{meal.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
