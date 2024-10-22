"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import toast,{Toaster} from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {ChevronRight} from "lucide-react";
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