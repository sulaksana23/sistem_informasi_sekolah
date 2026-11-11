import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, timeAgo } from "@/lib/helpers";
import { CalendarDays } from "lucide-react";

const SkeletonDateTimeCell = () => (
    <div className="flex items-center gap-1.5">
        <Skeleton className="size-3 rounded shrink-0" />
        <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-16" />
        </div>
    </div>
);

const DateTimeCell = ({ date }: { date: Date | string }) => (
    <div className="flex items-start gap-1.5">
        <CalendarDays className="mt-px size-3 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-xs font-medium text-foreground">
                {formatDateTime(date)}
            </span>
            <span className="text-[11px] text-muted-foreground">
                {timeAgo(date)}
            </span>
        </div>
    </div>
);

export { DateTimeCell, SkeletonDateTimeCell };
