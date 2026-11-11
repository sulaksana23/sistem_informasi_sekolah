export type SchoolRole = "admin" | "staff" | "teacher";

/** Sekolah tempat user tergabung (school_memberships). */
export interface TenantSchool {
    id: number
    name: string
    role: SchoolRole
    is_current?: boolean
}

/** Shared props `tenant` dari HandleInertiaRequests. */
export interface TenantProps {
    current_school: (Omit<TenantSchool, "is_current"> & { is_current?: boolean }) | null
    schools: TenantSchool[]
}
