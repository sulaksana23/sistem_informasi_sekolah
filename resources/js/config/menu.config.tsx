import { LayoutGrid, Component, Package, Settings, UsersRound, BookOpenCheck, CalendarCheck2, ClipboardList, UserRoundCog, Database, UserPlus } from "lucide-react";
import { type MenuConfig } from "./types";
import { route } from "ziggy-js";

// Menu KHUSUS section /example/* (routes/example.php) — dipakai
// layouts/main/components/SidebarMenu.tsx HANYA saat URL yang sedang dibuka
// diawali "/example" (lihat pathname.startsWith("/example") di sana). Tidak
// pernah tampil bareng MENU_SIDEBAR di bawah. Hapus const ini + import-nya
// di SidebarMenu.tsx kalau routes/example.php sudah tidak dipakai lagi
// (atau cukup matikan lewat .env EXAMPLE_ENABLED=false — lihat
// config/example.php).
export const EXAMPLE_MENU_SIDEBAR: MenuConfig = [
    {
        title: "Dashboard",
        icon: LayoutGrid,
        path: route("example.dashboard", undefined, false),
    },
    { heading: "Examples" },
    {
        // Modul acuan yang mengikuti docs/standard — lihat routes/example.php.
        title: "Products",
        icon: Package,
        path: route("example.products.index", undefined, false),
    },
    {
        title: "Components",
        icon: Component,
        path: route("example.components", undefined, false),
    },
    { heading: "Application" },
    {
        title: "Settings",
        icon: Settings,
        path: route("example.settings", undefined, false),
    },
];

// Menu project sungguhan. Dipakai SidebarMenu.tsx saat URL yang
// sedang dibuka TIDAK di section /example. Item yang butuh permission diberi
// `permission: "{module}.view"` (nama yang sama dengan middleware can: di route).
export const MENU_SIDEBAR: MenuConfig = [
    { title: "Dashboard", icon: LayoutGrid, path: route("dashboard", undefined, false) },
    { heading: "Master Data" },
    { title: "Ringkasan Master Data", icon: Database, path: route("school.master-data.index", undefined, false), permission: "school.manage" },
    { title: "Siswa", icon: UsersRound, path: route("school.students.index", undefined, false), permission: "school.manage" },
    { title: "Guru", icon: UserRoundCog, path: route("school.teachers.index", undefined, false), permission: "school.manage" },
    { title: "Kelas", icon: BookOpenCheck, path: route("school.classes.index", undefined, false), permission: "school.manage" },
    { title: "Mata Pelajaran", icon: BookOpenCheck, path: route("school.subjects.index", undefined, false), permission: "school.manage" },
    { title: "Tahun Ajaran", icon: CalendarCheck2, path: route("school.academic-years.index", undefined, false), permission: "school.manage" },
    { title: "Penempatan Siswa", icon: UserPlus, path: route("school.enrollments.index", undefined, false), permission: "school.manage" },
    { title: "Penugasan Guru", icon: ClipboardList, path: route("school.teacher-assignments.index", undefined, false), permission: "school.manage" },
    { heading: "Akademik" },
    { title: "Absensi", icon: CalendarCheck2, path: route("school.attendance.index", undefined, false), permission: "school.academic" },
    { title: "Input Nilai", icon: ClipboardList, path: route("school.grades.index", undefined, false), permission: "school.academic" },
    { title: "Laporan", icon: BookOpenCheck, path: route("school.reports.index", undefined, false), permission: "school.report" },
];
