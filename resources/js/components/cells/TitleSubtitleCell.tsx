import { Skeleton } from "@/components/ui/skeleton";
import { decodeHtml, toTitleCase } from "@/utils/formatters/string";

const SkeletonTitleSubtitleCell = () => (
    <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-3 w-[50%]" />
    </div>
);

const TitleSubtitleCell = ({
    title,
    subtitle,
    convertToTitleCase = true
}: {
    title: string;
    subtitle: string;
    convertToTitleCase?: boolean
}) => (
    <div className="min-w-0">
        <p className="max-w-65 truncate text-[13px] font-medium text-foreground">
            {convertToTitleCase ? toTitleCase(decodeHtml(title)) : decodeHtml(title)}
        </p>
        <p className="text-[11px] text-muted-foreground">
            {convertToTitleCase ? toTitleCase(decodeHtml(subtitle)) : decodeHtml(subtitle)}
        </p>
    </div>
);

export { TitleSubtitleCell, SkeletonTitleSubtitleCell };
