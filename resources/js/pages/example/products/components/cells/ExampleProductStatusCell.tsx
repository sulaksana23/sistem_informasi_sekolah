import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EXAMPLE_PRODUCT_STATUS_CONFIG, type ExampleProductStatus } from "@/types/example/product";

/** Status pill with a leading dot — the table-cell badge recipe from DESIGN-STANDARD §8.5. */
const ExampleProductStatusCell = ({ status }: { status: ExampleProductStatus }) => {
    const config = EXAMPLE_PRODUCT_STATUS_CONFIG[status];

    return (
        <Badge variant={config.badgeVariant} radius="full" className="px-2">
            <span className="size-1.5 shrink-0 rounded-full bg-[currentColor]" />
            {config.label}
        </Badge>
    );
};

const SkeletonExampleProductStatusCell = () => <Skeleton className="h-5 w-16 rounded-full" />;

export { ExampleProductStatusCell, SkeletonExampleProductStatusCell };
