import { Head, usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import TenantSwitcher from "@/components/common/tenant-switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { PageProps } from "@/types/common/page-props";

export type SelectOption = { value: string | number; label: string };
export type FieldSpec = {
    name: string;
    label: string;
    type: "text" | "email" | "date" | "number" | "select" | "textarea" | "checkbox";
    required?: boolean;
    options?: SelectOption[];
};
export type TableColumn = { key: string; label: string };

/** Nilai sentinel untuk Select opsional — Radix melarang `SelectItem` bernilai kosong. */
const EMPTY_VALUE = "__empty";

/** Kerangka halaman: Head + Container + Header template, plus alert error inline. */
export function SchoolPage({ title, description, children, actions }: {
    title: string; description: string; children: ReactNode; actions?: ReactNode;
}) {
    const { errors } = usePage<PageProps & { errors?: Record<string, string> }>().props;
    const pageError = errors?.record ?? errors?.students;
    return (
        <>
            <Head title={title} />
            <Container>
                <Header
                    title={title}
                    description={description}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <TenantSwitcher />
                            {actions}
                        </div>
                    }
                />
                <div className="space-y-4 pb-6">
                    {pageError && (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>{pageError}</AlertDescription>
                        </Alert>
                    )}
                    {children}
                </div>
            </Container>
        </>
    );
}

/** Panel = Card template (tanpa shadow) dengan judul opsional. */
export function Panel({ title, description, actions, children, className = "" }: {
    title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string;
}) {
    return (
        <Card className={cn(className)}>
            {(title || actions) && (
                <CardHeader className="border-b">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <p className="text-sm text-muted-foreground">{description}</p>}
                        </div>
                        {actions && <div className="flex items-center gap-2">{actions}</div>}
                    </div>
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );
}

/** Field form memakai Label + Input/Textarea/Select/Checkbox dari UI kit. */
export function SchoolField({ field, value, onChange, error }: {
    field: FieldSpec; value: string | number | boolean | null | undefined;
    onChange: (value: string | number | boolean) => void; error?: string;
}) {
    const id = `field-${field.name}`;
    const errorNode = error && <p className="text-xs text-destructive">{error}</p>;
    const label = (
        <Label htmlFor={id}>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
        </Label>
    );

    if (field.type === "select") {
        const raw = value === null || value === undefined ? "" : String(value);
        const options = field.options ?? [];
        return (
            <div className="grid content-start gap-1.5">
                {label}
                <Select
                    value={raw === "" ? EMPTY_VALUE : raw}
                    onValueChange={(next) => onChange(next === EMPTY_VALUE ? "" : next)}
                >
                    <SelectTrigger id={id} aria-label={field.label} aria-invalid={Boolean(error)}>
                        <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errorNode}
            </div>
        );
    }

    if (field.type === "checkbox") {
        return (
            <div className="grid content-start gap-1.5">
                <span className="text-sm font-medium leading-none">{field.label}</span>
                <label className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                        id={id}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => onChange(checked === true)}
                        aria-invalid={Boolean(error)}
                    />
                    <span>{Boolean(value) ? "Aktif" : "Tidak aktif"}</span>
                </label>
                {errorNode}
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <div className="grid content-start gap-1.5">
                {label}
                <Textarea
                    id={id}
                    required={field.required}
                    value={String(value ?? "")}
                    aria-invalid={Boolean(error)}
                    onChange={(event) => onChange(event.target.value)}
                />
                {errorNode}
            </div>
        );
    }

    return (
        <div className="grid content-start gap-1.5">
            {label}
            <Input
                id={id}
                type={field.type}
                min={field.type === "number" ? 1 : undefined}
                required={field.required}
                value={String(value ?? "")}
                aria-invalid={Boolean(error)}
                onChange={(event) => onChange(event.target.value)}
            />
            {errorNode}
        </div>
    );
}

/** Dialog konfirmasi hapus (DESIGN §8.9) — pengganti window.confirm. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Hapus", busy, onConfirm }: {
    open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string;
    confirmLabel?: string; busy?: boolean; onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={busy} onClick={onConfirm}>
                        {busy ? "Memproses…" : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}