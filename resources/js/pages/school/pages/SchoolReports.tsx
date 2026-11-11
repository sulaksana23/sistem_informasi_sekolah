import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Calculator, CalendarCheck2, CalendarX2, Download, GraduationCap, Printer, UsersRound } from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/common/stat-card";
import { Panel, SchoolPage, SelectOption } from "@/components/common/SchoolShared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
type ReportRow = {
    student_number: string; student_name: string; class_name: string;
    attendance_count: number; present_count: number; absent_count: number; average_score: string | number | null;
};
type Props = {
    years: SelectOption[]; classes: SelectOption[]; selected_year: number | null; selected_class: number | null;
    summary: { students: number; attendance_records: number; present_records: number; absent_records: number; average_score: number | null; rows: ReportRow[] };
};
const EMPTY_VALUE = "__empty";
const columns: { key: keyof ReportRow; label: string }[] = [
    { key: "student_number", label: "NIS" }, { key: "student_name", label: "Nama siswa" },
    { key: "class_name", label: "Kelas" }, { key: "attendance_count", label: "Catatan absensi" },
    { key: "present_count", label: "Hadir" }, { key: "absent_count", label: "Sakit / izin / alpa" },
    { key: "average_score", label: "Rata-rata nilai (%)" },
];
export default function SchoolReports(props: Props) {
    const [year, setYear] = useState(String(props.selected_year ?? ""));
    const [schoolClass, setSchoolClass] = useState(String(props.selected_class ?? ""));
    const applyFilter = () => router.get(route("school.reports.index"), {
        academic_year_id: year, school_class_id: schoolClass,
    }, { preserveScroll: true, replace: true });
    const downloadCsv = () => {
        const rows = [columns.map((column) => column.label), ...props.summary.rows.map((row) => columns.map((column) => row[column.key] ?? ""))];
        const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url; link.download = "laporan-akademik.csv"; link.click(); URL.revokeObjectURL(url);
    };
    return <SchoolPage
        title="Laporan Akademik"
        description="Ringkasan siswa, kehadiran, dan nilai pada tahun ajaran terpilih."
        actions={<div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
                <Printer />
                Cetak
            </Button>
            <Button type="button" onClick={downloadCsv}>
                <Download />
                Unduh CSV
            </Button>
        </div>}
    >
        <Panel title="Filter laporan" description="Pilih tahun ajaran dan kelas untuk menyusun ringkasan.">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div className="grid gap-1.5">
                    <Label htmlFor="report-year">Tahun ajaran</Label>
                    <Select value={year || EMPTY_VALUE} onValueChange={(value) => setYear(value === EMPTY_VALUE ? "" : value)}>
                        <SelectTrigger id="report-year" className="w-full"><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.years.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="report-class">Kelas</Label>
                    <Select value={schoolClass || EMPTY_VALUE} onValueChange={(value) => setSchoolClass(value === EMPTY_VALUE ? "" : value)}>
                        <SelectTrigger id="report-class" className="w-full"><SelectValue placeholder="Semua kelas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>Semua kelas</SelectItem>
                            {props.classes.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="button" variant="outline" onClick={applyFilter}>Tampilkan</Button>
            </div>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Siswa aktif" value={props.summary.students} icon={UsersRound} tone="brand" subtitle="Pada filter ini" />
            <StatCard title="Catatan absensi" value={props.summary.attendance_records} icon={CalendarCheck2} tone="neutral" subtitle="Total tersimpan" />
            <StatCard title="Hadir" value={props.summary.present_records} icon={GraduationCap} tone="success" subtitle="Status present" />
            <StatCard title="Sakit / izin / alpa" value={props.summary.absent_records} icon={CalendarX2} tone="warning" subtitle="Status non-hadir" />
            <StatCard title="Rata-rata nilai" value={props.summary.average_score ?? 0} suffix={props.summary.average_score === null ? undefined : "%"} icon={Calculator} tone="info" subtitle={props.summary.average_score === null ? "Belum ada nilai" : "Ternormalisasi"} />
        </div>
        <Panel title="Rincian per siswa" description={`${props.summary.rows.length} baris pada filter ini.`}>
            <Table>
                <TableHeader>
                    <TableRow>{columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                    {props.summary.rows.length === 0 ? (
                        <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">Tidak ada data untuk filter ini.</TableCell></TableRow>
                    ) : props.summary.rows.map((row) => (
                        <TableRow key={`${row.student_number}-${row.class_name}`}>
                            {columns.map((column) => (
                                <TableCell key={column.key} className={column.key === "average_score" || column.key.endsWith("_count") ? "tabular-nums" : undefined}>
                                    {column.key === "average_score"
                                        ? row.average_score === null ? "—" : `${Number(row.average_score).toFixed(2)}%`
                                        : row[column.key] ?? "—"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <p className="mt-3 text-xs text-muted-foreground">Rata-rata nilai menormalisasi setiap nilai terhadap nilai maksimumnya. Absensi dihitung dari catatan yang tersimpan.</p>
        </Panel>
    </SchoolPage>;
}