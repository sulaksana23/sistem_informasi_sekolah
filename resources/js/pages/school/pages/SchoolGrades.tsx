import { router, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ClipboardList, RefreshCw } from "lucide-react";
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
type StudentRow = { enrollment_id: number; student_number: string; name: string; score: string | number | null; note: string };
type GradeForm = {
    school_class_id: string; academic_year_id: string; subject_id: string; assessment_name: string;
    assessment_date: string; max_score: string | number; students: StudentRow[];
};
type Props = {
    years: SelectOption[]; classes: SelectOption[]; subjects: SelectOption[]; selected_year: number | null;
    selected_class: number | null; selected_subject: number | null; assessment_name: string;
    assessment_date: string; max_score: number; students: StudentRow[];
};
const EMPTY_VALUE = "__empty";
export default function SchoolGrades(props: Props) {
    const [filter, setFilter] = useState({
        year: String(props.selected_year ?? ""), schoolClass: String(props.selected_class ?? ""),
        subject: String(props.selected_subject ?? ""), assessment: props.assessment_name,
        date: props.assessment_date, maxScore: String(props.max_score),
    });
    const form = useForm<GradeForm>({
        school_class_id: String(props.selected_class ?? ""), academic_year_id: String(props.selected_year ?? ""),
        subject_id: String(props.selected_subject ?? ""), assessment_name: props.assessment_name,
        assessment_date: props.assessment_date, max_score: props.max_score, students: props.students,
    });
    useEffect(() => {
        setFilter({
            year: String(props.selected_year ?? ""), schoolClass: String(props.selected_class ?? ""),
            subject: String(props.selected_subject ?? ""), assessment: props.assessment_name,
            date: props.assessment_date, maxScore: String(props.max_score),
        });
        form.setData({
            school_class_id: String(props.selected_class ?? ""), academic_year_id: String(props.selected_year ?? ""),
            subject_id: String(props.selected_subject ?? ""), assessment_name: props.assessment_name,
            assessment_date: props.assessment_date, max_score: props.max_score, students: props.students,
        });
        form.clearErrors();
    }, [props.selected_year, props.selected_class, props.selected_subject, props.assessment_name, props.assessment_date, props.max_score, props.students]);
    const loadRoster = () => router.get(route("school.grades.index"), {
        academic_year_id: filter.year, school_class_id: filter.schoolClass, subject_id: filter.subject,
        assessment_name: filter.assessment, assessment_date: filter.date, max_score: filter.maxScore,
    }, { preserveScroll: true, replace: true });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post(route("school.grades.store")); };
    const setRow = (index: number, patch: Partial<StudentRow>) =>
        form.setData("students", form.data.students.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    const scored = form.data.students.filter((row) => row.score !== null && row.score !== "");
    const average = scored.length
        ? (scored.reduce((total, row) => total + Number(row.score), 0) / scored.length).toFixed(2)
        : null;
    return <SchoolPage title="Input Nilai" description="Masukkan nilai asesmen berdasarkan kelas dan mata pelajaran yang ditugaskan.">
        <Panel title="Pilih asesmen" description="Tentukan konteks penilaian sebelum mengisi nilai siswa.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-year">Tahun ajaran</Label>
                    <Select value={filter.year || EMPTY_VALUE} onValueChange={(value) => setFilter({ ...filter, year: value === EMPTY_VALUE ? "" : value, subject: "" })}>
                        <SelectTrigger id="grade-year" className="w-full"><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.years.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-class">Kelas</Label>
                    <Select value={filter.schoolClass || EMPTY_VALUE} onValueChange={(value) => setFilter({ ...filter, schoolClass: value === EMPTY_VALUE ? "" : value, subject: "" })}>
                        <SelectTrigger id="grade-class" className="w-full"><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.classes.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-subject">Mata pelajaran</Label>
                    <Select value={filter.subject || EMPTY_VALUE} onValueChange={(value) => setFilter({ ...filter, subject: value === EMPTY_VALUE ? "" : value })}>
                        <SelectTrigger id="grade-subject" className="w-full"><SelectValue placeholder="Pilih mata pelajaran" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EMPTY_VALUE}>—</SelectItem>
                            {props.subjects.map((item) => <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-assessment">Nama asesmen</Label>
                    <Input id="grade-assessment" value={filter.assessment} maxLength={120}
                        onChange={(event) => setFilter({ ...filter, assessment: event.target.value })} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-date">Tanggal asesmen</Label>
                    <Input id="grade-date" type="date" value={filter.date}
                        onChange={(event) => setFilter({ ...filter, date: event.target.value })} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="grade-max">Nilai maksimum</Label>
                    <Input id="grade-max" type="number" min="0.01" max="1000" step="0.01" value={filter.maxScore}
                        onChange={(event) => setFilter({ ...filter, maxScore: event.target.value })} />
                </div>
            </div>
            <Button type="button" variant="outline" className="mt-4" onClick={loadRoster}>
                <RefreshCw />
                Tampilkan daftar
            </Button>
        </Panel>
        <Panel title="Daftar siswa" description={`${props.students.length} siswa aktif${average ? ` · rata-rata terisi ${average}` : ""}.`}>
            {!props.selected_subject ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Pilih kelas dan mata pelajaran yang sudah ditugaskan.</p>
            ) : props.students.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada siswa aktif pada kelas dan tahun ajaran ini.</p>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIS</TableHead>
                                <TableHead>Nama siswa</TableHead>
                                <TableHead>Nilai / {form.data.max_score}</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {form.data.students.map((student, index) => (
                                <TableRow key={student.enrollment_id}>
                                    <TableCell className="tabular-nums text-muted-foreground">{student.student_number}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="w-36">
                                        <Input type="number" min="0" max={form.data.max_score} step="0.01"
                                            value={student.score ?? ""} placeholder="Kosong bila belum dinilai"
                                            aria-label={`Nilai ${student.name}`}
                                            onChange={(event) => setRow(index, { score: event.target.value })} />
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
                            {scored.length} dari {form.data.students.length} siswa sudah diisi nilai.
                        </p>
                        <Button type="submit" disabled={form.processing}>
                            <ClipboardList />
                            {form.processing ? "Menyimpan…" : "Simpan nilai"}
                        </Button>
                    </div>
                </form>
            )}
        </Panel>
    </SchoolPage>;
}