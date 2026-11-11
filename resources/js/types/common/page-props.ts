import type { TenantProps } from "@/types/common/tenancy";

export interface PageProps {
    auth: AuthProps
    flash: FlashProps
    tenant: TenantProps
    sso_url: string | null
    [key: string]: unknown
}

export interface FlashProps {
    success?: string
    error?: string
}

export interface AuthProps {
    user: AuthUser | null
    permissions: AuthPermission[]
}

export interface AuthUser {
    id: number
    name: string
    email: string
}

export interface AuthPermission {
    display_name: string
    permission_name: string
}
