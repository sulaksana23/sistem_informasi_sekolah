/**
 * Cermin App\Enums\SchoolLevel dan App\Enums\SchoolStatus.
 * Pemetaan label/badge status terpusat di sini (DESIGN §8.5).
 */
export type SchoolLevel = "tk" | "sd" | "smp" | "sma" | "smk" | "slb";
export type SchoolStatus = "negeri" | "swasta";

export const SCHOOL_LEVEL_OPTIONS: { value: SchoolLevel; label: string }[] = [
    { value: "tk", label: "TK / PAUD" },
    { value: "sd", label: "SD / MI" },
    { value: "smp", label: "SMP / MTs" },
    { value: "sma", label: "SMA / MA" },
    { value: "smk", label: "SMK / MAK" },
    { value: "slb", label: "SLB" },
];

export const SCHOOL_STATUS_OPTIONS: { value: SchoolStatus; label: string }[] = [
    { value: "negeri", label: "Negeri" },
    { value: "swasta", label: "Swasta" },
];

export const SCHOOL_ACCREDITATION_OPTIONS = ["A", "B", "C", "Belum terakreditasi"].map((value) => ({
    value,
    label: value,
}));
