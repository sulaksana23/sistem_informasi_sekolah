import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

const SkeletonCheckIconCell = () => (
    <Skeleton className="h-5 w-6 rounded-md" />
);

const CheckIconCell = ({ value }: { value: boolean }) => (
    <Badge
        variant={value ? "success" : "destructive"}
    >
        {value ? (
            <Check className="h-3.5 w-3.5" />
        ) : (
            <X className="h-3.5 w-3.5" />
        )}
    </Badge>
);

export { CheckIconCell, SkeletonCheckIconCell };
