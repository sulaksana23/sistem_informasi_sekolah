import { usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { PageProps } from "@/types/common/page-props";

/**
 * Hook to check user permissions from auth props.
 */
export function usePermission() {
    const { auth } = usePage<PageProps>().props;

    const permissionNames = useMemo(
        // `permissions` can be null when no SSO session exists yet (e.g. mid-redirect).
        () => new Set((auth.permissions ?? []).map((p) => p.permission_name)),
        [auth.permissions],
    );

    const hasPermission = useCallback(
        (permissionName: string) => permissionNames.has(permissionName),
        [permissionNames],
    );

    const hasAnyPermission = useCallback(
        (permissionNames_: string[]) =>
            permissionNames_.some((p) => permissionNames.has(p)),
        [permissionNames],
    );

    return { hasPermission, hasAnyPermission };
}
