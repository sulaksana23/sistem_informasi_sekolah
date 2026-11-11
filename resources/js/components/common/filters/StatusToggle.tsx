import { cn } from "@/lib/utils";

export interface StatusOption<T extends string = string> {
    value: T;
    label: string;
    activeClass?: string;
}

interface StatusToggleProps<T extends string = string> {
    options: StatusOption<T>[];
    value: T[];
    onChange: (value: T[]) => void;
    defaultActiveClass?: string;
}

export default function StatusToggle<T extends string = string>({
    options,
    value,
    onChange,
    defaultActiveClass = "bg-primary/10 text-primary border-primary/40",
}: StatusToggleProps<T>) {
    function toggle(status: T) {
        onChange(
            value.includes(status)
                ? value.filter((s) => s !== status)
                : [...value, status],
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => {
                const isActive = value.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt.value)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors",
                            isActive
                                ? (opt.activeClass ?? defaultActiveClass)
                                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
                        )}
                    >
                        {isActive && (
                            <span className="size-1.5 rounded-full bg-current shrink-0" />
                        )}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
