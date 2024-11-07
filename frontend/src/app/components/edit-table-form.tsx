import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { Dialog } from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const tableSchema = z.object({
    _id: z.string().optional(),
    number: z.coerce.number().min(1, "Table number is required"),
    name: z.string().min(1, "Table name is required"),
    seats: z.coerce.number().min(1, "Number of seats is required"),
    status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED"]),
});

export type TableFormValues = z.infer<typeof tableSchema>;

interface EditTableModalProps {
    isOpen: boolean;
    table: TableFormValues | null;
    onClose: () => void;
    onSave: (data: TableFormValues) => void;
}

export default function EditTableModal({ isOpen, table, onClose, onSave }: EditTableModalProps) {
    const form = useForm<TableFormValues>({
        resolver: zodResolver(tableSchema),
        defaultValues: { number: 1, name: "", seats: 1, status: "AVAILABLE" }, // Table status is set to AVAILABLE by default, can be RESERVED or OCCUPIED
    });

    useEffect(() => {
        if (table) form.reset(table);
    }, [table, form]);

    const handleSave = async (data: TableFormValues) => {
        try {
            onSave(data); // Ensure you await the onSave function
            toast.success("Table updated successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to update table");
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded p-6 w-full max-w-md">
                    <h2>Edit Table</h2>
                    <p>Please update the table details below.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSave)}>
                            <FormItem>
                                <FormLabel>Table Number</FormLabel>
                                <FormControl>
                                    <Input {...form.register("number")} placeholder="Enter Table Number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormItem>
                                <FormLabel>Table Name</FormLabel>
                                <FormControl>
                                    <Input {...form.register("name")} placeholder="Enter Table Name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormItem>
                                <FormLabel>Seats</FormLabel>
                                <FormControl>
                                    <Input {...form.register("seats")} placeholder="Enter Number of Seats" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value: "AVAILABLE" | "RESERVED" | "OCCUPIED") => form.setValue("status", value)}
                                        defaultValue={form.watch("status")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status">
                                                {form.watch("status") || "AVAILABLE"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="RESERVED">Reserved</SelectItem>
                                            <SelectItem value="OCCUPIED">Occupied</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="secondary" type="button" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Dialog>
    );
}