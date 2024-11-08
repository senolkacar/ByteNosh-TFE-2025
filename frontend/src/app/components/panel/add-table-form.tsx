import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const tableSchema = z.object({
    number: z.coerce.number().min(1, "Table number is required"),
    name: z.string().min(1, "Table name is required"),
    seats: z.coerce.number().min(1, "Number of seats is required"),
    status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED"]),
});

export type TableFormValues = z.infer<typeof tableSchema>;

interface AddTableFormProps {
    onSubmit: (data: TableFormValues) => void;
}

export default function AddTableForm({ onSubmit }: AddTableFormProps) {
    const form = useForm<TableFormValues>({
        mode: "onChange",
        resolver: zodResolver(tableSchema),
        defaultValues: {number: 1, name: "", seats: 1, status: "AVAILABLE"},
    });

    const handleSubmit = async (data: TableFormValues) => {
        try {
            onSubmit(data);
            form.reset();
        } catch (error) {
            toast.error("Failed to add table");
        }
    };

    return (
        <div className="flex flex-col w-full space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col space-y-4">
                    <div className="flex w-full justify-between space-x-4">
                        <FormItem className="flex-1">
                            <FormLabel>Table Number</FormLabel>
                            <FormControl>
                                <Input {...form.register("number")} placeholder="Enter Table Number"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                        <FormItem className="flex-1">
                            <FormLabel>Table Name</FormLabel>
                            <FormControl>
                                <Input {...form.register("name")} placeholder="Enter Table Name"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                        <FormItem className="flex-1">
                            <FormLabel>Seats</FormLabel>
                            <FormControl>
                                <Input {...form.register("seats")} placeholder="Enter Number of Seats"/>
                            </FormControl>
                            <FormMessage/>
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
                    </div>

                    {/* Button placed after the form fields to be at the bottom */}
                    <Button
                        type="submit"
                        disabled={!form.formState.isValid && !form.formState.isDirty}
                        className="mt-4 w-1/3 self-center"
                    >
                        Add Table
                    </Button>
                </form>
            </Form>
        </div>
    );
}
