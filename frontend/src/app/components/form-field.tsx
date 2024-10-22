import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldComponentProps {
    control: any;
    name: string;
    label: string;
    placeholder: string;
    description: string;
    type?: "input" | "textarea";
}

export function FormFieldComponent({ control, name, label, placeholder, description, type = "input" }: FormFieldComponentProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {type === "input" ? (
                            <Input placeholder={placeholder} {...field} />
                        ) : (
                            <Textarea placeholder={placeholder} {...field} />
                        )}
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}