import { router } from "@inertiajs/react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    type PaginationMeta,
    Panel,
    SchoolField,
    SchoolPage,
    type SelectOption,
    ServerPagination,
} from "@/components/common/SchoolShared";

type Values = Record<string, string | number | null> | null;
type Log = {
    id: number; event: "created" | "updated"; type: string; subject: string; user_name: string | null;
    old_values: Values; new_values: Values; created_at: string | null;
};
type Props = { logs: Log[]; pagination: PaginationMeta; selected_type: string | null; types: SelectOption[] };

const FIELD_LABELS: Record<string, string> = {
    status: "Status", note: "Catatan", score: "Nilai", max_score: "Nilai maks.", assessment_date: "Tanggal",
};

function describeChange(log: Log): string {
    const next = log.new_values ?? {};
    const prev = log.old_values ?? {};
    const keys = Object.keys(next).filter((key) => log.event === "created" || prev[key] !== next[key]);
    return keys.map((key) => {
        const label = FIELD_LABELS[key] ?? key;
        const after = next[key] ?? "—";
        return log.event === "created" ? `${label}: ${after}` : `${label}: ${prev[key] ?? "—"} → ${after}`;
    }).join("; ") || "—";
}

export default function AuditLogIndex({ logs, pagination, selected_type, types }: Props) {
    const [busy, setBusy] = useState(false);
    const typeLabel = Object.fromEntries(types.map((type) => [type.value, type.label]));
    const visit = (params: { type?: string | null; page?: number }) => router.get(window.location.pathname, {
        type: params.type || undefined, page: params.page && params.page > 1 ? params.page : undefined,
    }, { preserveState: true, preserveScroll: true, replace: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) });

    return (
        <SchoolPage title="Riwayat Perubahan" description="Jejak perubahan nilai dan absensi: siapa mengubah, kapan, dan apa yang berubah.">
            <Panel
                title="Log perubahan"
                description={`${pagination.total} catatan.`}
                actions={
                    <div className="w-48">
                        <SchoolField
                            field={{ name: "type", label: "Jenis data", type: "select", options: types }}
                            value={selected_type ?? ""}
                            onChange={(value) => visit({ type: String(value) })}
                        />
                    </div>
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Pengguna</TableHead>
                            <TableHead>Jenis</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Perubahan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                    Belum ada perubahan tercatat.
                                </TableCell>
                            </TableRow>
                        ) : logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">{log.created_at ?? "—"}</TableCell>
                                <TableCell>{log.user_name ?? "—"}</TableCell>
                                <TableCell>{typeLabel[log.type] ?? log.type} · {log.event === "created" ? "Baru" : "Diubah"}</TableCell>
                                <TableCell>{log.subject}</TableCell>
                                <TableCell className="text-sm">{describeChange(log)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ServerPagination meta={pagination} busy={busy}
                    onPageChange={(page) => visit({ type: selected_type, page })} />
            </Panel>
        </SchoolPage>
    );
}
