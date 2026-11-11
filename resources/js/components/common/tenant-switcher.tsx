import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Building2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PageProps } from "@/types/common/page-props";

/** Label peran keanggotaan sekolah (cermin App\Enums\SchoolRole). */
const ROLE_LABELS: Record<string, string> = {
    admin: "Administrator",
    staff: "Tata Usaha",
    teacher: "Guru",
};

/**
 * Pemilih sekolah aktif. Tampil bila user tergabung di ≥2 sekolah;
 * bila satu sekolah, cukup menampilkan nama + perannya.
 */
export function TenantSwitcher() {
    const tenant = usePage<PageProps>().props.tenant;
    const schools = tenant?.schools ?? [];
    const current = tenant?.current_school ?? null;

    if (current === null) return null;

    if (schools.length < 2) {
        return (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                {current.name} · {ROLE_LABELS[current.role]}
            </span>
        );
    }

    const handleSwitch = (schoolId: string) => {
        // Full reload supaya TanStack Query (key berbasis URL) tidak mereka
        // cache sekolah sebelumnya sesaat setelah pindah sekolah.
        router.post(route("tenant.current.store"), { school_id: Number(schoolId) }, {
            onSuccess: () => window.location.reload(),
        });
    };

    return (
        <Select value={String(current.id)} onValueChange={handleSwitch}>
            <SelectTrigger className="w-64" aria-label="Ganti sekolah aktif">
                <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4 shrink-0" />
                    <SelectValue />
                </span>
            </SelectTrigger>
            <SelectContent>
                {schools.map((school) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                        {school.name} · {ROLE_LABELS[school.role]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default TenantSwitcher;
