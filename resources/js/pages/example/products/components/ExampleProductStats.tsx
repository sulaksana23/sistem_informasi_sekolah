import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleSlash, FilePen, Package } from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/common/stat-card";
import { exampleProductKeys, getExampleProductStatistics } from "@/api/example/product";

/** A single query owned by one component may live inline — queryFn from api/, key from the factory (FRONTEND-STANDARD §8.2). */
export default function ExampleProductStats() {
    const { data, isLoading } = useQuery({
        queryKey: exampleProductKeys.statistics(),
        queryFn: getExampleProductStatistics,
    });

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Total products" value={data.total} icon={Package} tone="brand" subtitle="All statuses" />
            <StatCard title="Active" value={data.active} icon={CircleCheck} tone="success" subtitle="Sold in stores" />
            <StatCard title="Draft" value={data.draft} icon={FilePen} tone="neutral" subtitle="Not published yet" />
            <StatCard title="Inactive" value={data.inactive} icon={CircleSlash} tone="destructive" subtitle="Hidden from stores" />
        </div>
    );
}
