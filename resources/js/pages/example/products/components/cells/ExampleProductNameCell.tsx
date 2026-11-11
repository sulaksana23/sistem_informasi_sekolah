import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Skeleton } from "@/components/ui/skeleton";

const ExampleProductNameCell = ({ id, name, sku }: { id: number; name: string; sku: string }) => (
    <div className="min-w-0">
        <Link
            href={route("example.products.detail", { id })}
            className="block max-w-65 truncate text-sm font-medium text-foreground hover:text-primary"
        >
            {name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{sku}</p>
    </div>
);

const SkeletonExampleProductNameCell = () => (
    <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
    </div>
);

export { ExampleProductNameCell, SkeletonExampleProductNameCell };
