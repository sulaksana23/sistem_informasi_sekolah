import { router, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { CalendarCheck2, RefreshCw } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Panel, SchoolPage, SelectOption } from "@/components/common/SchoolShared";
type StudentRow = { enrollment_id: number; student_number: string; name: string; status: string; note: string };
type AttendanceForm = { school_class_id: string; academic_year_id: string; attendance_date: string; students: StudentRow[] };
type Props = {
    years: SelectOption[]; classes: SelectOption[]; selected_year: number | null; selected_class: number | null;
    selected_date: string; students: StudentRow[]; statuses: SelectOption[];
};
const EMPTY_VALUE = "__empty";
export default function SchoolAttendance(props: Props) {
    const [filter, setFilter] = useState({ year: String(props.selected_year ?? ""), schoolClass: String(props.selected_class ?? ""), date: props.selected_date });
    const form = useForm<AttendanceForm>({
        school_class_id: String(props.selected_class ?? ""), academic_year_id: String(props.selected_year ?? ""),
        attendance_date: props.selected_date, students: props.students,
    });
    useEffect(() => {
        setFilter({ year: String(props.selected_year ?? ""), schoolClass: String(props.selected_class ?? ""), date: props.selected_date });
        form.setData({
            school_class_id: String(props.selected_class ?? ""), academic_year_id: String(props.selected_year ?? ""),
            attendance_date: props.selected_date, students: props.students,
        });
        form.clearErrors();
    }, [props.selected_year, props.selected_class, props.selected_date, props.students]);
    const loadRoster = () => router.get(route("school.attendance.index"), {
        academic_year_id: filter.year, school_class_id: filter.schoolClass, attendance_date: filter.date,
    }, { preserveScroll: true, replace: true });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route("school.attendance.store"));
    };
    const setRow = (index: number, patch: Partial<StudentRow>) =>
        form.setData("students", form.data.students.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    return <SchoolPage title="Absensi Siswa" description="Catat kehadiran harian untuk siswa pada kelas yang ditugaskan.">
        <Panel title="Pilih kelas dan tanggal" description="Daftar siswa dimuat sesuai tahun ajaran, kelas, dan tanggal yang dipilih.">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                <div className="grid gap-1.5">
                    <Label htmlFor="attendance-year">Tahun ajaran</Label>
                    <Select value={filter.year || EMPTY_VALUE} onValueChange={(value) => setFilter({ ...filter, year: value === EMPTY_VALUE ? "" : value })}>
                        <SelectTrigger id="attendance-year" className="w-full"><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.years.map((year) => <SelectItem key={year.value} value={String(year.value)}>{year.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="attendance-class">Kelas</Label>
                    <Select value={filter.schoolClass || EMPTY_VALUE} onValueChange={(value) => setFilter({ ...filter, schoolClass: value === EMPTY_VALUE ? "" : value })}>
                        <SelectTrigger id="attendance-class" className="w-full"><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.classes.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="attendance-date">Tanggal</Label>
                    <Input id="attendance-date" type="date" value={filter.date} onChange={(event) => setFilter({ ...filter, date: event.target.value })} />
                </div>
                <Button type="button" variant="outline" onClick={loadRoster}>
                    <RefreshCw />
                    Tampilkan
                </Button>
            </div>
        </Panel>
        <Panel title="Daftar siswa" description={`${props.students.length} siswa aktif pada kelas ini.`}>
            {props.students.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada siswa aktif pada kelas dan tahun ajaran ini. Periksa penempatan siswa.</p>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIS</TableHead>
                                <TableHead>Nama siswa</TableHead>
                                <TableHead>Status kehadiran</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {form.data.students.map((student, index) => (
                                <TableRow key={student.enrollment_id}>
                                    <TableCell className="tabular-nums text-muted-foreground">{student.student_number}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="min-w-44">
                                        <Select value={student.status} onValueChange={(value) => setRow(index, { status: value })}>
                                            <SelectTrigger className="w-full" aria-label={`Status ${student.name}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {props.statuses.map((status) => <SelectItem key={status.value} value={String(status.value)}>{status.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="min-w-56">
                                        <Input value={student.note} maxLength={500} placeholder="Opsional"
                                            aria-label={`Catatan ${student.name}`}
                                            onChange={(event) => setRow(index, { note: event.target.value })} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                            {form.data.students.filter((row) => row.status === "present").length} dari {form.data.students.length} siswa tercatat hadir.
                        </p>
                        <Button type="submit" disabled={form.processing}>
                            <CalendarCheck2 />
                            {form.processing ? "Menyimpan…" : "Simpan absensi"}
                        </Button>
                    </div>
                </form>
            )}
        </Panel>
    </SchoolPage>;
}