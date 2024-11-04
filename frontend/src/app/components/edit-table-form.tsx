import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { Dialog } from "@/components/ui/dialog"; // Adjust the import path for your Dialog component

const tableSchema = z.object({
    _id: z.string().optional(),
    number: z.coerce.number().min(1, "Table number is required"),
    name: z.string().min(1, "Table name is required"),
    seats: z.coerce.number().min(1, "Number of seats is required"),
    isAvailable: z.boolean(),
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
        defaultValues: { number: 1, name: "", seats: 1, isAvailable: true },
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
                                <FormLabel>Is Available?</FormLabel>
                                <FormControl>
                                    <Checkbox
                                        checked={!!form.watch("isAvailable")}
                                        onCheckedChange={(checked: boolean) => form.setValue("isAvailable", checked)}
                                    />
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