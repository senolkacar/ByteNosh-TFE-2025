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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import toast,{Toaster} from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {ChevronRight} from "lucide-react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import PaginationComponent from "@/app/components/pagination";



export default function CategoryConfiguration() {
    const [categories, setCategories] = useState<any[]>([]);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;


    const formDefaultValues = {
        name: '',
        description: '',
    };
    const uniqueCategoryName = (categories: any[]) => {
        return z.string().min(3, "Name must be at least 3 characters").refine((name) => {
            return !categories.some((category) => category.name === name && category._id !== editingCategory?._id);
        }, {
            message: "Category name must be unique",
        });
    };

    const categorySchema = (categories: any[]) => z.object({
        name: uniqueCategoryName(categories),
        description: z.string().min(3, "Description must be at least 3 characters"),
    });


    const categoryForm = useForm({
        mode: "onChange",
        resolver: zodResolver(categorySchema(categories)),
        defaultValues: formDefaultValues,
    });

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

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await fetch(`/api/category/${categoryId}`, {
                method: "DELETE",
            });
            if(editingCategory?._id === categoryId) {
                handleReset()
            }
            setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
            categoryForm.reset();
            toast.success("Category deleted successfully");
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        categoryForm.reset({
            name: category.name,
            description: category.description
        });
    };

    const handleReset = () => {
        setEditingCategory(null);
        categoryForm.reset(
            formDefaultValues
        );
    };

    // Handle Category Form Submission
    const handleCategorySubmit = async (data: any) => {
        if (editingCategory) {
            // If editing, send a PUT request to update the category
            try {
                await fetch(`/api/category/${editingCategory._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat._id === editingCategory._id ? { ...cat, ...data } : cat
                    )
                );
                categoryForm.reset(data); // Clear the form
                //handleReset()
                toast("Category updated successfully");
            } catch (error) {
                console.error("Failed to update category", error);
            }
        } else {
            // If adding a new category, send a POST request
            try {
                const response = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const newCategory = await response.json();

                // Update categories state immediately after adding a new category
                setCategories((prev) => [...prev, newCategory]); // Add the new category to the list
                categoryForm.reset(); // Clear the form
                toast.success("Category added successfully");
            } catch (error) {
                console.error("Failed to add category", error);
            }
        }
    };

    const totalPages = Math.ceil(categories.length / rowsPerPage);
    const currentData = categories.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div>
            {/* Category Form (for both add and edit) */}
            <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center cursor-pointer">
                                <h3 className="font-semibold text-lg">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                                <ChevronRight/>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {/* Form Section */}
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Category Name" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category name.</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={categoryForm.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category description.</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit"
                                    disabled={!categoryForm.formState.isDirty || !categoryForm.formState.isValid || categoryForm.formState.isSubmitting}
                            >{editingCategory ? "Update" : "Add"} Category</Button>
                            {editingCategory && (
                                <Button onClick={() =>{
                                    handleReset()
                                    }
                                } variant="secondary">
                                    Cancel Edit
                                </Button>
                            )}

                            {/* List of Categories Section */}
                            <h2 className="font-semibold mt-4">Existing Categories</h2>
                            <Table>
                                <TableCaption> A list of existing categories</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="flex-1">Category Name</TableHead>
                                        <TableHead className="flex justify-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentData.map((category) => (
                                        <TableRow key={category._id}>
                                            <TableCell className="flex-1">{category.name}</TableCell>
                                            <TableCell className="flex justify-center">
                                                <Button
                                                    className="mx-1"
                                                    type="button"
                                                    onClick={() => handleEditCategory(category)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(category._id)}
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
        </div>
            )
}