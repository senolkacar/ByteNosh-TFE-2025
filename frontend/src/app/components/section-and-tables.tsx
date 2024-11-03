"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const sectionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    tables: z
        .array(
            z.object({
                number: z.number().min(1, "Table number is required"),
                name: z.string().min(1, "Table name is required"),
                seats: z.number().min(1, "Number of seats is required"),
                isAvailable: z.boolean(),
            })
        )
        .min(1, "At least one table is required"),
});

export default function SectionAndTables() {
    const [sections, setSections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tables, setTables] = useState([]);
    const [editingTable, setEditingTable] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const rowsPerPage = 5;

    useEffect(() => {
        async function fetchSections() {
            try {
                const response = await fetch("/api/sections");
                const sectionsData = await response.json();
                setSections(sectionsData);
            } catch (error) {
                console.error("Failed to fetch sections", error);
            }
        }

        fetchSections();
    }, []);

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            name: "",
            description: "",
            tables: [{ number: 1, name: "", seats: 1, isAvailable: true }],
        },
    });

    const handleSectionSubmit = async (data:any) => {
        try {
            const response = await fetch("/api/sections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Section created successfully");
                form.reset();
            } else {
                toast.error("Failed to create section");
            }
        } catch (error) {
            console.error("Error creating section:", error);
        }
    };

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tables",
    });

    const handleSearchSection = async (name:string) => {
        try {
            const response = await fetch(`/api/sections/${name}`);
            const section = await response.json();
            if (section) {
                form.setValue("name", section.name);
                form.setValue("description", section.description);
                setTables(section.tables);
            }
        } catch (error) {
            console.error("Failed to search for section", error);
        }
    };

    const handleEditTable = (table :any) => {
        setEditingTable(table);
        setIsEditing(true);
        form.setValue("tables", [table]);
    };

    const handleAddTable = () => {
        setEditingTable(null);
        setIsEditing(true);
        form.setValue("tables", [{ number: 0, name: "", seats: 1, isAvailable: true }]);
    };

    const currentData = tables.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const totalPages = Math.ceil(tables.length / rowsPerPage);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSectionSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                    <Input placeholder="Section Name" {...field} />
                                    <Button
                                        type="button"
                                        onClick={() => handleSearchSection(field.value)}
                                    >
                                        Get Section
                                    </Button>
                                </div>
                            </FormControl>
                            <FormDescription>Enter the section name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormDescription>Enter the section description.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="btn">
                    Save
                </Button>
                <Toaster />

                <h2 className="font-semibold mt-4">Tables for section </h2>
                <Table>
                    <TableCaption>List of tables for this section</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Seats</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((table, index) => (
                            <TableRow key={table._id || index}>
                                <TableCell>{table.number}</TableCell>
                                <TableCell>{table.name}</TableCell>
                                <TableCell>{table.seats}</TableCell>
                                <TableCell>{table.isAvailable ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                    <Button type="button" onClick={() => handleEditTable(table)}>
                                        Edit
                                    </Button>
                                    <Button type="button" onClick={() => remove(index)} variant="destructive">
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
                    <div>
                        <h3 className="text-lg font-semibold">Tables</h3>
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex space-x-4">
                                <FormField
                                    control={form.control}
                                    name={`tables.${index}.number`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Table Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tables.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Table Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tables.${index}.seats`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seats</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Number of Seats" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tables.${index}.isAvailable`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-center space-y-6">
                                            <FormLabel className="mt-1.5">Available</FormLabel>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                        <Button className="my-2" type="button" onClick={handleAddTable}>
                           {isEditing ? "Save" : "Add Table"}
                        </Button>
                    </div>
            </form>
        </Form>
    );
}