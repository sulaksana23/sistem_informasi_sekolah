import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/helpers";
import { User } from "@/types/common/user";
import { UserX2 } from "lucide-react";

const SkeletonUserCell = () => (
    <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full shrink-0" />
        <Skeleton className="h-3 w-24" />
    </div>
);

const UserCell = ({ user }: { user?: User }) => {
    if (!user) return (
        <div className="flex items-center gap-1.5">
            <UserX2 className="size-3.5 text-muted-foreground/50" />
            <span className="text-[11px] italic text-muted-foreground">Not Found</span>
        </div>
    );

    return (
        <div className="flex items-center gap-2">
            <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold">
                    {getInitials(user.name, 2)}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="truncate text-xs font-medium text-foreground">
                    {user.name}
                </span>
                <span className="truncate text-[11px] italic text-muted-foreground">
                    {user.id}
                </span>
            </div>
        </div>
    );
};

export { UserCell, SkeletonUserCell };
