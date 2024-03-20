// Menu Page
'use client';
import MainTitle from "@/app/components/maintitle";
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

export default function Menu(){
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All dishes');
    const [searchQuery, setSearchQuery] = useState<string>('');
    useEffect(() => {
        fetch('/api/meals')
            .then(response => response.json())
            .then((data: Meal[]) => setMeals(data)) // Use the Meal type for fetched data
            .catch(error => console.error('Error fetching meals:', error));
    }, []);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    const filteredMeals = meals.filter(meal =>
        (selectedCategory === 'All dishes' || meal.category === selectedCategory) &&
        (meal.name.toLowerCase().includes(searchQuery) ||
            (meal.vegan && 'vegan'.includes(searchQuery)) ||
            (meal.vegetarian && 'vegetarian'.includes(searchQuery)))
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value.toLowerCase());
    };
    return(
        <>
            <MainTitle title={"Menu"} description={"Discover our delicious dishes and drinks"} linkText={"Home"} linkUrl={"/"}/>
            <div className="mx-auto max-w-screen-xl p-8">
                <div className="flex flex-col lg:grid grid-cols-1 lg:grid-cols-4 gap-8 text-center">
                    <div className="lg:flex col-span-3 gap-3 mt-12 mb-12">
                        {['All dishes', 'Starters', 'Main Dishes', 'Desserts', 'Drinks'].map(category => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`w-full active:bg-yellow-400 font-bold bg-gray-200 opacity-30 px-12 py-3 md:px-6 md:py-3 
                                ${selectedCategory === category ? 'bg-yellow-400 opacity-95' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="flex col-span-1 justify-center mb-5 lg:justify-end items-center">
                        <input
                            type="search"
                            placeholder="Search for a dish"
                            className="border-2 border-gray-200 p-3 rounded-lg"
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMeals.map(meal => (
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
        </>
    )
}