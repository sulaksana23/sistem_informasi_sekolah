import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowRight, BookOpenCheck, CalendarCheck2, ClipboardList, GraduationCap, UsersRound } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { StatCard } from "@/components/common/stat-card";
import { Panel, SchoolPage } from "@/components/common/SchoolShared";
import { Badge } from "@/components/ui/badge";
import type { ElementType } from "react";
type Props = { stats: { students: number; teachers: number; classes: number; active_enrollments: number; today_attendance: number; today_present: number; academic_year: string | null } };
export default function SchoolDashboard({ stats }: Props) {
    const { hasPermission } = usePermission();
    const cards = [
        { title: "Siswa aktif", value: stats.students, icon: GraduationCap, tone: "brand" as const, subtitle: "Status aktif" },
        { title: "Guru aktif", value: stats.teachers, icon: UsersRound, tone: "info" as const, subtitle: "Status aktif" },
        { title: "Kelas", value: stats.classes, icon: BookOpenCheck, tone: "neutral" as const, subtitle: "Rombongan belajar" },
        { title: "Penempatan aktif", value: stats.active_enrollments, icon: CalendarCheck2, tone: "success" as const, subtitle: stats.academic_year ? `TA ${stats.academic_year}` : "Belum ada tahun aktif" },
    ];
    return <SchoolPage
        title="Dashboard Sekolah"
        description={stats.academic_year ? `Tahun ajaran aktif: ${stats.academic_year}` : "Mulai dengan mengatur data dan tahun ajaran sekolah."}
    >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ title, ...card }) => <StatCard key={title} title={title} {...card} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
            <Panel
                title="Absensi hari ini"
                description="Angka hanya mencakup catatan yang sudah disimpan untuk tanggal hari ini."
                actions={<Badge variant={stats.today_attendance > 0 ? "success-outline" : "outline"}>
                    {stats.today_attendance > 0 ? "Sudah tercatat" : "Belum tercatat"}
                </Badge>}
            >
                <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Catatan tersimpan</dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-secondary-foreground">{stats.today_attendance}</dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Hadir</dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-secondary-foreground">{stats.today_present}</dd>
                    </div>
                </dl>
                {hasPermission("school.academic") && (
                    <Link href={route("school.attendance.index")} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Buka absensi
                        <ArrowRight className="size-4" />
                    </Link>
                )}
            </Panel>
            <Panel title="Akses cepat" description="Jalan pintas ke halaman yang paling sering dipakai.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {hasPermission("school.manage") && <>
                        <QuickLink href={route("school.students.index")} icon={UsersRound} label="Data siswa" />
                        <QuickLink href={route("school.teachers.index")} icon={UsersRound} label="Data guru" />
                        <QuickLink href={route("school.enrollments.index")} icon={GraduationCap} label="Penempatan siswa" />
                        <QuickLink href={route("school.teacher-assignments.index")} icon={ClipboardList} label="Penugasan guru" />
                    </>}
                    {hasPermission("school.academic") && <QuickLink href={route("school.grades.index")} icon={ClipboardList} label="Input nilai" />}
                    {hasPermission("school.report") && <QuickLink href={route("school.reports.index")} icon={BookOpenCheck} label="Laporan akademik" />}
                </div>
            </Panel>
        </div>
    </SchoolPage>;
}
function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: ElementType }) {
    return (
        <Link href={href} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted/50">
            <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                {label}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
    );
}