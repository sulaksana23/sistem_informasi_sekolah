import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonIsActiveBadgeCell = () => (
    <Skeleton className="h-4 w-13 rounded-full" />
)

const IsActiveBadgeCell = ({ isActive }: { isActive: boolean }) => (
    <Badge
        variant="outline"
        className={isActive
            ? "gap-1 rounded-full px-2 border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-500"
            : "gap-1 rounded-full px-2 border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-500"
        }
    >
        {isActive ? "Active" : "Inactive"}
    </Badge>
);

export { IsActiveBadgeCell, SkeletonIsActiveBadgeCell };
