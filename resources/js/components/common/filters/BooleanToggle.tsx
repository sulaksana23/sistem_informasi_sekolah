import { cn } from "@/lib/utils";
import { useIntl } from "react-intl";

interface BooleanToggleProps {
    value: boolean | undefined;
    onChange: (value: boolean | undefined) => void;
    trueLabel?: string;
    falseLabel?: string;
    trueClass?: string;
    falseClass?: string;
}

export default function BooleanToggle({
    value,
    onChange,
    trueLabel,
    falseLabel,
    trueClass = "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    falseClass = "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700",
}: BooleanToggleProps) {
    const intl = useIntl();
    const resolvedTrueLabel = trueLabel ?? intl.formatMessage({ id: "COMMON.YES", defaultMessage: "Yes" });
    const resolvedFalseLabel = falseLabel ?? intl.formatMessage({ id: "COMMON.NO", defaultMessage: "No" });

    function toggle(target: boolean) {
        onChange(value === target ? undefined : target);
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            <button
                type="button"
                onClick={() => toggle(true)}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors",
                    value === true
                        ? trueClass
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
                )}
            >
                {value === true && <span className="size-1.5 rounded-full bg-current shrink-0" />}
                {resolvedTrueLabel}
            </button>
            <button
                type="button"
                onClick={() => toggle(false)}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors",
                    value === false
                        ? falseClass
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
                )}
            >
                {value === false && <span className="size-1.5 rounded-full bg-current shrink-0" />}
                {resolvedFalseLabel}
            </button>
        </div>
    );
}
