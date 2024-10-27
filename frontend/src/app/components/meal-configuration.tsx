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
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import PaginationComponent from "@/app/components/pagination";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";



const mealSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    price: z.number().min(0, "Price must be a positive number"),
    image: z.string(),
    vegetarian: z.boolean(),
    vegan: z.boolean(),
    category: z.string().min(1, "Please select a category"),
});

export default function MealConfiguration() {
    const [editingMeal, setEditingMeal] = useState<any>(null);
    const [meals, setMeals] = useState<any[]>([]);
    const [showDeleteDialog, setDeleteShowDialog] = useState(false);
    const [deleteMeal, setDeleteMeal] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    // Meal form setup
    const formDefaultValues = {
        name: '',
        description: '',
        price: 0,
        image: '',
        vegetarian: false,
        vegan: false,
        category: '',  // Will be linked to a selected category
    };


    const mealForm = useForm({
        mode: "onChange",
        resolver: zodResolver(mealSchema),
        defaultValues: formDefaultValues,
    });

    // Fetch categories and set to state
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                const categories = await response.json();
                setCategories(categories); // Example: categories could be an array
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        }

        fetchCategories();
    }, []);

    // Fetch meals and set to state (example API call)
    useEffect(() => {
        async function fetchMeals() {
            try {
                const response = await fetch("/api/meals");
                const meals = await response.json();
                setMeals(meals);  // Example: meals could be an array
            } catch (error) {
                console.error("Failed to fetch meals", error);
            }
        }

        fetchMeals();
    }, []);

    const handleDeleteMeal = async (mealId: string) => {
        setDeleteMeal(mealId);
        setDeleteShowDialog(true);
    };

    const confirmDeleteMeal = async () => {
        if (deleteMeal) {
            try {
                const res = await fetch(`/api/meals/${deleteMeal}`, {
                    method: "DELETE",
                });
                if(editingMeal?._id === deleteMeal) {
                    handleReset();
                }
                setMeals((prev) => prev.filter((meal) => meal._id !== deleteMeal));
                const result = await res.json();
                if (res.ok) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error("Failed to delete meal", error);
            } finally {
                setDeleteShowDialog(false);
                setDeleteMeal(null);
                mealForm.reset();
            }
        }
    };

    const handleEditMeal = (meal: any) => {
        setEditingMeal(meal);
        mealForm.reset({
            name: meal.name,
            description: meal.description,
            price: meal.price,
            image: meal.image,
            vegetarian: meal.vegetarian,
            vegan: meal.vegan,
            category: meal.category._id,
        });
    };

    const handleReset = () => {
        mealForm.reset(
            formDefaultValues
        );
        setEditingMeal(null);
    };

    // Handle Meal Form Submission
    const handleMealSubmit = async (data: any) => {
        if (editingMeal) {
            // If editing, send a PUT request to update the meal
            try {
                 await fetch(`/api/meals/${editingMeal._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                setMeals((prev) =>
                    prev.map((meal) =>
                        meal._id === editingMeal._id ? { ...meal, ...data } : meal
                    )
                );
                setEditingMeal(null); // Clear editing mode
                mealForm.reset(); // Clear the form
            } catch (error) {
                console.error("Failed to update meal", error);
            }
        } else {
            // If adding a new meal, send a POST request
            try {
                const response = await fetch("/api/meals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!response.ok) {
                    throw new Error(`Failed with status: ${response.status}`);
                }
                const newMeal = await response.json();

                // Update meals state immediately after adding a new meal
                setMeals((prev) => [...prev, newMeal]); // Add the new meal to the list
                mealForm.reset(); // Clear the form
            } catch (error) {
                console.error("Failed to add meal", error);
            }
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                // Save the image filename in your form
                mealForm.setValue('image', data.filename);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const totalPages = Math.ceil(meals.length / rowsPerPage);
    const currentData = meals.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
return (
    <div>
        {/* Meal Form */}
        <Form {...mealForm}>
            <form onSubmit={mealForm.handleSubmit(handleMealSubmit)} className="space-y-4">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center cursor-pointer">
                            <h3 className="font-semibold text-lg">{editingMeal ? "Edit Meal" : "Add Meal"}</h3>
                            <ChevronRight/>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <FormField
                            control={mealForm.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Meal Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Meal Name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the meal name.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mealForm.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the meal description.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mealForm.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Price"
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? "" : Number(e.target.value);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the meal price in €.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mealForm.control}
                            name="image"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Meal Image</FormLabel>
                                    <FormControl>
                                        <div>
                                            {editingMeal && field.value && (
                                                <div>
                                                    {/* Show current image when editing */}
                                                    <img
                                                        src={`http://localhost:5000/images/${field.value}`}
                                                        alt="Meal"
                                                        className="w-1/5 h-1/5 object-cover rounded-lg mb-4"
                                                    />
                                                    <p>Current Image: {field.value}</p>
                                                </div>
                                            )}
                                            {/* File input for uploading new image */}
                                            <Input type="file" onChange={e => handleImageUpload(e)}/>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Upload a meal image.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mealForm.control}
                            name="vegetarian"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Vegetarian</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value ? "true" : "false"}
                                            onValueChange={(value) => field.onChange(value === "true")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="vegetarian-true"/>
                                                <label htmlFor="vegan-true">Yes</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="vegetarian-false"/>
                                                <label htmlFor="vegan-false">No</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormDescription>Is the meal vegetarian?</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={mealForm.control}
                            name="vegan"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Vegan</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value ? "true" : "false"}
                                            onValueChange={(value) => field.onChange(value === "true")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="vegan-true"/>
                                                <label htmlFor="vegan-true">Yes</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="vegan-false"/>
                                                <label htmlFor="vegan-false">No</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormDescription>Is the meal vegan?</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mealForm.control}
                            name="category"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category">
                                                    {/* Find the category name based on the saved category._id */}
                                                    {categories.find((category) => category._id === field.value)?.name || "Select category"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category._id}
                                                        value={category._id} // Ensure _id is used as value
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>Select the meal category.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={!mealForm.formState.isDirty || !mealForm.formState.isValid || mealForm.formState.isSubmitting}
                        >
                            {editingMeal ? "Update" : "Add"} Meal

                        </Button>
                        {editingMeal && (
                            <Button
                                onClick={() => {
                                    setEditingMeal(null);
                                   handleReset();
                                }}
                                variant="secondary"
                            >
                                Cancel Edit
                            </Button>
                        )}
                        {/* List of Meals Section */}
                        <h2 className="font-semibold mt-4">Existing Meals</h2>
                        <Table>
                            <TableCaption> A list of existing meals</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="flex-1">Meal Name</TableHead>
                                    <TableHead className="flex justify-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((meal) => (
                                    <TableRow key={meal._id}>
                                        <TableCell className="flex-1">{meal.name}</TableCell>
                                        <TableCell className="flex justify-center">
                                            <Button
                                                className="mx-1"
                                                type="button"
                                                onClick={() => handleEditMeal(meal)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleDeleteMeal(meal._id)}
                                                variant="destructive"
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </CollapsibleContent>
                </Collapsible>
                <Toaster/>
            </form>
        </Form>
        <AlertDialog open={showDeleteDialog} onOpenChange={setDeleteShowDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the meal ?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteShowDialog(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteMeal}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
)
}