import type { SchoolLevel, SchoolStatus } from "./enums";

/**
 * Profil sekolah aktif — mirror App\Services\School\SchoolServiceImplement::profile()
 * (docs/standard/FRONTEND-STANDARD.md §13: nama field tetap snake_case seperti JSON).
 */
export interface SchoolProfile {
    id: number;
    name: string;
    npsn: string | null;
    level: SchoolLevel | null;
    level_label: string | null;
    status: SchoolStatus | null;
    status_label: string | null;
    accreditation: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    headmaster_name: string | null;
    founded_year: number | null;
    description: string | null;
    created_at: string | null;
    member_count: number;
    student_count: number;
    teacher_count: number;
}

/** Payload form profil: semua opsional kecuali `name` (cermin UpdateSchoolProfileRequest). */
export interface SchoolProfileFormData {
    name: string;
    npsn: string;
    level: SchoolLevel | "";
    status: SchoolStatus | "";
    accreditation: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    headmaster_name: string;
    founded_year: string;
    description: string;
}
