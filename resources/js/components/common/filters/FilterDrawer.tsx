import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { FilterIcon, FilterX, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

interface FilterDrawerProps {
    title?: string;
    description?: string;
    trigger: React.ReactNode;
    children: (draft: any, setDraftField: (key: string, value: any) => void) => React.ReactNode;
    filters: Record<string, any>;
    defaults: Record<string, any>;
    onChange: (filters: any) => void;
    countActive: (f: any) => number;
}

export default function FilterDrawer({
    title,
    description,
    trigger,
    children,
    filters,
    defaults,
    onChange,
    countActive,
}: FilterDrawerProps) {
    const [draft, setDraft] = useState(filters);
    const [open, setOpen] = useState(false);
    const intl = useIntl();
    const resolvedTitle =
        title ?? intl.formatMessage({ id: "COMMON.FILTERS", defaultMessage: "Filters" });

    function syncDraft(open: boolean) {
        if (open) setDraft(filters);
        setOpen(open);
    }

    function setDraftField(key: string, value: any) {
        setDraft((prev: any) => ({ ...prev, [key]: value }));
    }

    function apply() {
        onChange(draft);
        setOpen(false);
    }

    function reset() {
        setDraft(defaults);
        onChange(defaults);
        setOpen(false);
    }

    const activeCount = countActive(filters);
    const draftActiveCount = countActive(draft);

    return (
        <Drawer direction="right" open={open} onOpenChange={syncDraft}>
            <DrawerTrigger render={trigger as React.ReactElement} />

            <DrawerContent className="flex flex-col sm:max-w-sm">
                <DrawerHeader className="border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-base font-semibold">{resolvedTitle}</DrawerTitle>
                            {description && (
                                <DrawerDescription className="text-xs">
                                    {description}
                                </DrawerDescription>
                            )}
                        </div>
                        {activeCount > 0 && (
                            <Badge variant="default" className="ml-auto rounded-full h-5 px-1.5 text-[10px]">
                                {activeCount}
                            </Badge>
                        )}
                    </div>
                </DrawerHeader>

                <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    {children(draft, setDraftField)}
                </div>

                <DrawerFooter className="border-t border-border pt-4">
                    <Button onClick={apply} className="cursor-pointer">
                        <FilterIcon className="h-4 w-4 mr-1.5" />
                        <FormattedMessage id="COMMON.APPLY_FILTERS" defaultMessage="Apply Filters" />
                        {draftActiveCount > 0 && (
                            <Badge variant="secondary" className="ml-1.5 rounded-full h-4 px-1.5 text-[10px]">
                                {draftActiveCount}
                            </Badge>
                        )}
                    </Button>
                    <div className="flex gap-2">
                        {activeCount > 0 && (
                            <Button
                                variant="ghost"
                                onClick={reset}
                                className="flex-1 cursor-pointer text-muted-foreground"
                            >
                                <FilterX className="h-4 w-4 mr-1.5" />
                                <FormattedMessage id="COMMON.RESET" defaultMessage="Reset" />
                            </Button>
                        )}
                        <DrawerClose
                            render={
                                <Button variant="outline" className={cn("cursor-pointer", activeCount > 0 ? "flex-1" : "w-full")}>
                                    <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                                </Button>
                            }
                        />
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
