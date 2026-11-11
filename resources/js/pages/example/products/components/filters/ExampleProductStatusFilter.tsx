import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAMPLE_PRODUCT_STATUS_CONFIG, type ExampleProductStatus } from "@/types/example/product";

export type ExampleProductStatusFilterValue = ExampleProductStatus | "all";

export const EXAMPLE_PRODUCT_FILTERS_DEFAULT: { status: ExampleProductStatusFilterValue } = { status: "all" };

interface ExampleProductStatusFilterProps {
    value: ExampleProductStatusFilterValue;
    onChange: (value: ExampleProductStatusFilterValue) => void;
}

export default function ExampleProductStatusFilter({ value, onChange }: ExampleProductStatusFilterProps) {
    return (
        <Select value={value} onValueChange={(next) => onChange(next as ExampleProductStatusFilterValue)}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(EXAMPLE_PRODUCT_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                        {config.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
