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
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import PaginationComponent from "@/app/components/pagination";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";

export default function CategoryConfiguration() {
    const [categories, setCategories] = useState<any[]>([]);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const session = useSession();
    const formDefaultValues = {
        name: '',
        description: '',
    };

    const uniqueCategoryName = (categories: any[], excludeId?: string) => {
        return z
            .string()
            .min(3, "Name must be at least 3 characters")
            .refine((name) => {
                return !categories.some(
                    (category) => category.name === name && category._id !== excludeId
                );
            }, {
                message: "Category name must be unique",
            });
    };

    const categorySchema = (categories: any[], excludeId?: string) =>
        z.object({
            name: uniqueCategoryName(categories, excludeId),
            description: z.string().min(3, "Description must be at least 3 characters"),
        });

    // Form for adding a new category
    const categoryForm = useForm({
        mode: "onChange",
        resolver: zodResolver(categorySchema(categories)),
        defaultValues: formDefaultValues,
    });

    // Form for editing an existing category
    const editForm = useForm({
        mode: "onChange",
        resolver: zodResolver(categorySchema(categories, editingCategory?._id)),
        defaultValues: formDefaultValues,
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                const categories = await response.json();
                setCategories(categories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        }

        fetchCategories();
    }, []);

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await fetch(`/api/categories/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                method: "DELETE",
            });
            if (editingCategory?._id === categoryId) {
                setEditingCategory(null);
                editForm.reset();
            }
            setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
            toast.success("Category deleted successfully");
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        editForm.reset({
            name: category.name,
            description: category.description,
        });
        setEditModalOpen(true);
    };

    // Handle Category Form Submission for adding a new category
    const handleCategorySubmit = async (data: any) => {
        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${session.data?.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const newCategory = await response.json();

            // Update categories state immediately after adding a new category
            setCategories((prev) => [...prev, newCategory]);
            categoryForm.reset();
            toast.success("Category added successfully");
        } catch (error) {
            console.error("Failed to add category", error);
        }
    };

    // Handle Category Form Submission for editing an existing category
    const handleCategoryEditSubmit = async (data: any) => {
        if (editingCategory) {
            try {
                await fetch(`/api/categories/${editingCategory._id}`, {
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${session.data?.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat._id === editingCategory._id ? { ...cat, ...data } : cat
                    )
                );
                editForm.reset();
                setEditingCategory(null);
                setEditModalOpen(false);
                toast.success("Category updated successfully");
            } catch (error) {
                console.error("Failed to update category", error);
            }
        }
    };

    const totalPages = Math.ceil(categories.length / rowsPerPage);
    const currentData = categories.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div>
            {/* Category Form for Adding New Category */}
            <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center cursor-pointer">
                                <h3 className="font-semibold text-lg">Add Category</h3>
                                <ChevronRight />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {/* Form Section */}
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Category Name" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={categoryForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category description.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    !categoryForm.formState.isDirty ||
                                    !categoryForm.formState.isValid ||
                                    categoryForm.formState.isSubmitting
                                }
                            >
                                Add Category
                            </Button>

                            {/* List of Categories Section */}
                            <h2 className="font-semibold mt-4">Existing Categories</h2>
                            <Table>
                                <TableCaption>A list of existing categories</TableCaption>
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
                    <Toaster />
                </form>
            </Form>

            {/* Edit Category Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleCategoryEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Category Name" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter the category description.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={
                                        !editForm.formState.isDirty ||
                                        !editForm.formState.isValid ||
                                        editForm.formState.isSubmitting
                                    }
                                >
                                    Update Category
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setEditModalOpen(false);
                                        setEditingCategory(null);
                                        editForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
