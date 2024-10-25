"use client";
import { z } from "zod";
import CategoryConfiguration from "@/app/components/category-configuration";
import MealConfiguration from "@/app/components/meal-configuration";



const mealSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    price: z.number().min(0, "Price must be a positive number"),
    image: z.string(),
    vegetarian: z.boolean(),
    vegan: z.boolean(),
    category: z.string(),
    categoryName: z.string(),
});

export default function MenuManagement() {


    return (
        <>
        <CategoryConfiguration/>
            <MealConfiguration/>
        </>

    );
}