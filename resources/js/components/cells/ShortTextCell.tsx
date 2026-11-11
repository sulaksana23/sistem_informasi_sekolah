import { Skeleton } from "@/components/ui/skeleton";
import { decodeHtml, toTitleCase } from "@/utils/formatters/string";

const SkeletonShortTextCell = () => (
    <div className="truncate">
        <Skeleton className="h-4 w-[80px]" />
    </div>
);

const ShortTextCell = ({
    text,
    convertToTitleCase = true
}: {
    text: string | undefined,
    convertToTitleCase?: boolean
}) => {
    const decoded = decodeHtml(text ?? "-");

    const value = convertToTitleCase
        ? toTitleCase(decoded)
        : decoded;

    return (
        <span className="text-[13px] text-secondary-foreground font-normal truncate block">
            {value}
        </span>
    );
};

export { ShortTextCell, SkeletonShortTextCell };
