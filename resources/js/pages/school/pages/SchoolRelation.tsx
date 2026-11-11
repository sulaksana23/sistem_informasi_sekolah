import { router, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ConfirmDialog,
    FieldSpec,
    Panel,
    SchoolField,
    SchoolPage,
    TableColumn,
} from "@/components/common/SchoolShared";
type FormValue = string | number | boolean | null;
type Props = {
    type: "enrollments" | "teacher-assignments"; title: string; description: string;
    fields: FieldSpec[]; columns: TableColumn[]; records: Array<Record<string, unknown> & { id: number }>;
    year_options: Array<{ value: number; label: string }>; selected_year: number | null;
};
function blank(fields: FieldSpec[]) { return Object.fromEntries(fields.map((field) => [field.name, ""])) as Record<string, FormValue>; }
export default function SchoolRelation(props: Props) {
    const form = useForm<Record<string, FormValue>>(useMemo(() => blank(props.fields), [props.fields]));
    const [deleting, setDeleting] = useState<number | null>(null);
    const storeRoute = props.type === "enrollments" ? "school.enrollments.store" : "school.teacher-assignments.store";
    const deleteRoute = props.type === "enrollments" ? "school.enrollments.destroy" : "school.teacher-assignments.destroy";
    const indexRoute = props.type === "enrollments" ? "school.enrollments.index" : "school.teacher-assignments.index";
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route(storeRoute), { preserveScroll: true, onSuccess: () => form.setData(blank(props.fields)) });
    };
    const confirmDelete = () => {
        if (deleting === null) return;
        router.delete(route(deleteRoute, { id: deleting }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };
    return <SchoolPage title={props.title} description={props.description}>
        <Panel title="Tambah relasi" description="Pilih data yang sudah tersedia, lalu simpan.">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {props.fields.map((field) => <SchoolField key={field.name} field={field} value={form.data[field.name]}
                        onChange={(value) => form.setData(field.name, value)} error={form.errors[field.name]} />)}
                </div>
                <Button type="submit" disabled={form.processing}>
                    <Plus />
                    {form.processing ? "Menyimpan…" : "Simpan"}
                </Button>
            </form>
        </Panel>
        <Panel
            title="Daftar relasi"
            description={`${props.records.length} baris tersimpan.`}
            actions={props.year_options.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tahun ajaran</span>
                    <select
                        aria-label="Filter tahun ajaran"
                        className="h-9 rounded-sm border border-input bg-background px-3 text-sm"
                        value={props.selected_year ?? ""}
                        onChange={(event) => router.get(route(indexRoute), { academic_year_id: event.target.value }, { preserveScroll: true })}
                    >
                        <option value="">Semua tahun</option>
                        {props.year_options.map((year) => <option key={year.value} value={year.value}>{year.label}</option>)}
                    </select>
                </div>
            )}
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        {props.columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.records.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={props.columns.length + 1} className="py-10 text-center text-muted-foreground">
                                Belum ada data.
                            </TableCell>
                        </TableRow>
                    ) : props.records.map((row) => (
                        <TableRow key={row.id}>
                            {props.columns.map((column) => <TableCell key={column.key}>{String(row[column.key] ?? "—")}</TableCell>)}
                            <TableCell className="text-right">
                                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(row.id)}>
                                    <Trash2 />
                                    Hapus
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Panel>
        <ConfirmDialog
            open={deleting !== null}
            onOpenChange={(open) => !open && setDeleting(null)}
            title="Hapus relasi ini?"
            description="Relasi yang sudah dipakai absensi atau nilai tidak dapat dihapus."
            onConfirm={confirmDelete}
        />
    </SchoolPage>;
}