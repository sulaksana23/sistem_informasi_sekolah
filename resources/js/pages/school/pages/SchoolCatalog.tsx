import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
type CatalogRow = Record<string, FormValue> & { id: number };
type Props = {
    section: string; title: string; description: string; fields: FieldSpec[]; columns: TableColumn[]; records: CatalogRow[];
};
function blank(fields: FieldSpec[], source?: CatalogRow): Record<string, FormValue> {
    return Object.fromEntries(fields.map((field) => [field.name, source?.[field.name] ?? (field.type === "checkbox" ? false : "")]));
}
export default function SchoolCatalog(props: Props) {
    const [editing, setEditing] = useState<CatalogRow | null>(null);
    const [deleting, setDeleting] = useState<CatalogRow | null>(null);
    const initial = useMemo(() => blank(props.fields), [props.fields]);
    const form = useForm<Record<string, FormValue>>(initial);
    const reset = () => { setEditing(null); form.setData(blank(props.fields)); form.clearErrors(); };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (editing) form.put(route("school.catalog.update", { section: props.section, id: editing.id }), { onSuccess: reset });
        else form.post(route("school.catalog.store", { section: props.section }), { onSuccess: reset });
    };
    const edit = (row: CatalogRow) => { setEditing(row); form.setData(blank(props.fields, row)); form.clearErrors(); };
    const confirmDelete = () => {
        if (!deleting) return;
        form.delete(route("school.catalog.destroy", { section: props.section, id: deleting.id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };
    const rowLabel = (row: CatalogRow) => String(
        row.name ?? row.student_number ?? row.employee_number ?? row.code ?? row.id,
    );
    return <SchoolPage title={props.title} description={props.description}>
        <Panel title={editing ? "Ubah data" : "Tambah data"} description={editing ? "Perbarui data lalu simpan perubahan." : "Lengkapi kolom bertanda * untuk menambah data baru."}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {props.fields.map((field) => <SchoolField key={field.name} field={field} value={form.data[field.name]}
                        onChange={(value) => form.setData(field.name, value)} error={form.errors[field.name]} />)}
                </div>
                {form.errors.section && <p className="text-xs text-destructive">{form.errors.section}</p>}
                <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={form.processing}>
                        {editing ? <Pencil /> : <Plus />}
                        {form.processing ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah data"}
                    </Button>
                    {editing && <Button type="button" variant="outline" onClick={reset}>Batal</Button>}
                </div>
            </form>
        </Panel>
        <Panel title="Daftar data" description={`${props.records.length} baris tersimpan.`}>
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
                                <div className="flex justify-end gap-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => edit(row)}>
                                        <Pencil />
                                        Ubah
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(row)}>
                                        <Trash2 />
                                        Hapus
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Panel>
        <ConfirmDialog
            open={deleting !== null}
            onOpenChange={(open) => !open && setDeleting(null)}
            title="Hapus data ini?"
            description={deleting ? `Data "${rowLabel(deleting)}" akan dihapus permanen.` : undefined}
            busy={form.processing}
            onConfirm={confirmDelete}
        />
    </SchoolPage>;
}