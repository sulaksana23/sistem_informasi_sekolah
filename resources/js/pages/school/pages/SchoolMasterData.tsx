import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowRight, BookOpenCheck, CalendarCheck2, ClipboardList, Database, GraduationCap, UserRoundCog, UsersRound } from "lucide-react";
import { Panel, SchoolPage } from "@/components/common/SchoolShared";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
type Section = { key: string; title: string; count: number; description: string };
const ROUTES: Record<string, string> = {
    students: "school.students.index", teachers: "school.teachers.index", classes: "school.classes.index",
    subjects: "school.subjects.index", "academic-years": "school.academic-years.index",
    enrollments: "school.enrollments.index", "teacher-assignments": "school.teacher-assignments.index",
};
const ICONS: Record<string, typeof Database> = {
    students: UsersRound, teachers: UserRoundCog, classes: BookOpenCheck, subjects: BookOpenCheck,
    "academic-years": CalendarCheck2, enrollments: GraduationCap, "teacher-assignments": ClipboardList,
};
const STEPS = [
    "Buat tahun ajaran aktif.",
    "Tambahkan data guru dan mata pelajaran.",
    "Buat kelas dan data siswa.",
    "Atur penempatan siswa lalu penugasan guru.",
    "Mulai absensi, input nilai, dan laporan.",
];
export default function SchoolMasterData({ sections }: { sections: Section[] }) {
    return <SchoolPage title="Master Data" description="Ringkasan data sekolah. Pilih bagian untuk menambah atau memperbarui datanya.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => {
                const Icon = ICONS[section.key] ?? Database;
                const href = ROUTES[section.key];
                return (
                    <Card key={section.key}>
                        <CardContent>
                            <Link href={href ? route(href) : route("school.master-data.index")} className="group block">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="text-lg font-semibold tabular-nums text-secondary-foreground">{section.count}</span>
                                </div>
                                <h2 className="mt-3 text-base font-medium">{section.title}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                                    Kelola
                                    <ArrowRight className={cn("size-4 transition-transform group-hover:translate-x-0.5")} />
                                </span>
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
        <Panel title="Urutan pengaturan yang disarankan" description="Ikuti langkah ini saat menyiapkan sekolah baru.">
            <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {STEPS.map((step, index) => (
                    <li key={step} className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                        <span className="mb-1 block text-xs font-semibold text-foreground">Langkah {index + 1}</span>
                        {step}
                    </li>
                ))}
            </ol>
        </Panel>
    </SchoolPage>;
}