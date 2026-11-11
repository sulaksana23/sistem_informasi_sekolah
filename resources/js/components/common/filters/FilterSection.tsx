interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </p>
            {children}
        </div>
    );
}
