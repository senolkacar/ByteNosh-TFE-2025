import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import AddTableForm, { TableFormValues } from "@/app/components/panel/add-table-form";
import EditTableModal from "@/app/components/panel/edit-table-form";
import TableModel from "@/app/models/table";
import SectionModel from "@/app/models/section";
import { toast, Toaster } from "react-hot-toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";


const sectionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    isIndoor: z.boolean(),
});

export default function SectionAndTables() {
    const [sections, setSections] = useState<SectionModel[]>([]);
    const [tables, setTables] = useState<TableModel[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionModel>();
    const [editingTable, setEditingTable] = useState<TableModel | null>(null);
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
    const [initialTables, setInitialTables] = useState<TableModel[]>([]);
    const [tablesModified, setTablesModified] = useState(false);

    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            name: "",
            description: "",
            isIndoor: false,
            tables: [{ number: 1, name: "", seats: 1, status: "AVAILABLE" }],
        },
    });

    const name = useWatch({ control: form.control, name: "name" });
    const description = useWatch({ control: form.control, name: "description" });

    const isSectionFilled = name && description;

    useEffect(() => {
        const hasChanges = JSON.stringify(tables) !== JSON.stringify(initialTables);
        setTablesModified(hasChanges);
    }, [tables, initialTables]);

    let nextId = 0;

    const handleAddTable = async (table: TableFormValues) => {
        try {
            setTables([...tables, { ...table,  _id: uuidv4(), section: selectedSection?._id }]);
            toast.success("Table added successfully");
            setTablesModified(true);
        } catch (error) {
            toast.error("Failed to add table");
        }
    };

    const handleDeleteTable = async (table: TableModel) => {
        if (!table._id) return;
        try {
            const response = await fetch(`/api/tables/${table._id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setTables(tables.filter((t) => t._id !== table._id));
                toast.success("Table deleted successfully");
            }
        } catch (error) {
            console.error("Failed to delete table", error);
            toast.error("Failed to delete table");
        }
    };

    const handleSearchSection = async (name: string) => {
        try {
            const response = await fetch(`/api/sections/${encodeURIComponent(name)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    toast.error("Section not found");
                } else {
                    toast.error("Failed to retrieve section");
                }
                return;
            }
            const section = await response.json();
            form.setValue("name", section.name);
            form.setValue("description", section.description);
            form.setValue("isIndoor", section.isIndoor);
            setSelectedSection(section);
            setTables(section.tables);
            setInitialTables(section.tables);
        } catch (error) {
            console.error("Failed to search for section", error);
            toast.error("Failed to retrieve section");
        }
    };

    const handleSectionSubmit = async (data: any) => {
        const sectionData = { name: data.name, description: data.description, isIndoor: data.isIndoor, tables: tables };
        try {
            const response = await fetch("/api/sections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sectionData),
            });
            if (response.ok) {
                const section = await response.json();
                setSections([...sections, section]);
                toast.success("Section saved successfully");
                form.reset();
                setTablesModified(false);
            }
        } catch (error) {
            console.error("Failed to save section", error);
            toast.error("Failed to save section");
        }
    };

    const handleEditTable = async (table: TableModel) => {
        try {
            const response = await fetch(`/api/tables/${table._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(table),
            });
            if (response.ok) {
                const updatedTable = await response.json();
                setTables(tables.map((t) => (t._id === updatedTable._id ? updatedTable : t)));
            }
        } catch (error) {
            console.error("Failed to update table", error);
            toast.error("Failed to update table");
        }
    };

    return (
        <div className="section-and-tables">
            <h2>Manage Sections</h2>
            <FormProvider {...form}>
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
                    <FormField
                        control={form.control}
                        name="isIndoor"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>Indoor</FormLabel>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    </FormControl>
                                </div>
                                <FormDescription>Check if the section is indoors.</FormDescription>
                                <FormMessage/>
                            </FormItem>

                        )}
                    />
                    <Button
                        type="submit"
                        disabled={!form.formState.isDirty || !tablesModified}
                    >
                    Save
                    </Button>
                    {tablesModified && (
                        <p className="text-red-500 italic">
                            Warning: You have unsaved table changes. Please click "Save" to apply them.
                        </p>
                    )}
                    <Toaster />
                </form>


            <h2 className="font-semibold mt-2">Add New Table</h2>
            {!isSectionFilled && (
                <p className="text-red-500 italic">
                    Please fill in the section name and description to add tables.
                </p>
            )}
            {(isSectionFilled || selectedSection) && (
                <>
                    <p className="font-light italic">Adding table to section {selectedSection?.name}</p>
                    <AddTableForm onSubmit={handleAddTable} />
                </>
            )}

            <h2 className="font-semibold mt-4">Tables for section {selectedSection?.name}</h2>
            <Table>
                <TableCaption>List of tables for this section</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Table Name</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table) => (
                        <TableRow key={table._id}>
                            <TableCell>{table.name}</TableCell>
                            <TableCell>{table.seats}</TableCell>
                            <TableCell><Badge variant="outline"> {table.status}</Badge></TableCell>
                            <TableCell>
                                <Button type="button" variant="destructive" onClick={() => {
                                    setTables(tables.filter((t) => t._id !== table._id));
                                    handleDeleteTable(table);
                                }}>Delete</Button>
                                <Button type="button" className="mx-1" onClick={() => {
                                    setEditingTable(table);
                                    setIsEditingModalOpen(true);
                                }}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <EditTableModal
                isOpen={isEditingModalOpen}
                table={editingTable}
                onClose={() => setIsEditingModalOpen(false)}
                onSave={(updatedTable: TableModel) => {
                    setTables(tables.map((table) => (table._id === updatedTable._id ? updatedTable : table)));
                    handleEditTable(updatedTable);
                    setIsEditingModalOpen(false);
                }}
            />
            </FormProvider>
        </div>
    );
}