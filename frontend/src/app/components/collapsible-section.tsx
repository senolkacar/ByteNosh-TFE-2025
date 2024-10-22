import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
    title: string;
    children: ReactNode;
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <ChevronRight />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
    );
}