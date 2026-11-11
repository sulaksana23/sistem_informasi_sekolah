import { Button } from "@/components/ui/button";
import { DateSelector, DateSelectorValue, formatDateValue } from "@/components/ui/date-selector";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

interface DatePickerButtonProps {
    title: string;
    value: DateSelectorValue | undefined;
    onChange: (v: DateSelectorValue | undefined) => void;
}

export default function DatePickerButton({ title, value, onChange }: DatePickerButtonProps) {
    const [open, setOpen] = useState(false);
    const [internal, setInternal] = useState<DateSelectorValue | undefined>(value);
    const intl = useIntl();

    useEffect(() => {
        if (open) setInternal(value);
    }, [open]);

    const displayText = value
        ? formatDateValue(value)
        : intl.formatMessage({ id: "COMMON.SELECT_DATE", defaultMessage: "Select date" });

    return (
        <div className="flex items-center gap-1.5">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={
                    <Button
                        variant="outline"
                        className={cn(
                            "flex-1 justify-start text-xs h-8 min-w-0",
                            !value && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{displayText}</span>
                    </Button>
                }>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <DateSelector value={internal} onChange={setInternal} showInput={true} />
                    <DialogFooter>
                        <DialogClose render={
                            <Button variant="outline">
                                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                            </Button>
                        } />
                        <Button onClick={() => { onChange(internal); setOpen(false); }}>
                            <FormattedMessage id="COMMON.APPLY" defaultMessage="Apply" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => onChange(undefined)}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
