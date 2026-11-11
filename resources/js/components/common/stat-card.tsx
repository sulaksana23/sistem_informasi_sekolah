import type { ElementType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

/** State colors for the icon chip only — the number itself always stays neutral
 * (docs/standard/DESIGN-STANDARD.md §1.4, §8.3). */
const TONES = {
    brand: "bg-brand-softer border-brand-soft text-primary dark:text-brand-medium",
    neutral: "bg-secondary border-border text-secondary-foreground",
    success: "bg-success/10 border-success/20 text-success-foreground",
    warning: "bg-warning/10 border-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 border-destructive/20 text-destructive",
    info: "bg-info/10 border-info/20 text-info-foreground",
} as const;

export type StatCardTone = keyof typeof TONES;

interface StatCardProps {
    title: string;
    value: number;
    icon: ElementType;
    tone?: StatCardTone;
    subtitle?: ReactNode;
    /** Rendered right after the number, e.g. "%" or "/ 519". */
    suffix?: ReactNode;
}

export function StatCard({ title, value, icon: Icon, tone = "brand", subtitle, suffix }: StatCardProps) {
    const animated = useAnimatedNumber(value);
    const isInteger = Number.isInteger(value);

    return (
        <Card size="sm">
            <CardContent>
                <div className="flex items-start justify-between gap-2">
                    <p className="pt-0.5 text-[11px] font-semibold uppercase text-muted-foreground">{title}</p>
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", TONES[tone])}>
                        <Icon className="size-4" />
                    </div>
                </div>
                <p className="truncate pb-1.5 text-lg font-semibold leading-tight tabular-nums text-secondary-foreground">
                    {isInteger ? animated.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    {suffix && <span className="ml-0.5 text-sm font-medium text-muted-foreground">{suffix}</span>}
                </p>
                {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

export function StatCardSkeleton() {
    return (
        <Card size="sm">
            <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="size-8 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}
