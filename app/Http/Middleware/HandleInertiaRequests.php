<?php

namespace App\Http\Middleware;

use App\Enums\SchoolRole;
use App\Services\Tenancy\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Lazy (closure) so it's resolved after route middleware such as
            // auth + tenant.context has established the request context.
            'auth' => fn () => [
                'user' => Auth::user(),
                // Permissions berasal dari peran keanggotaan sekolah aktif
                // (TenantContext). Tanpa konteks, daftar tetap kosong.
                'permissions' => $this->permissionsFor(Auth::user()),
            ],
            // Sekolah aktif + daftar sekolah tempat user tergabung.
            // Null/[] saat belum ada keanggotaan.
            'tenant' => fn () => TenantContext::active()->snapshot(),
            // null when itmm/sso isn't installed or config/sso.php doesn't exist —
            // the "Application List" link in user-dropdown-menu.tsx only renders
            // once auth.user is set (i.e. a request actually went through
            // verified.sso), so this is safe to share unconditionally.
            'sso_url' => config('sso.url'),
        ];
    }

    private function permissionsFor(?object $user): array
    {
        if ($user === null) {
            return [];
        }

        // Sumber permission project: enum peran keanggotaan per sekolah
        // (SchoolRole). Mengikuti mapping Gate di AppServiceProvider. Bila
        // ada provisi peran eksternal (SSO), daftarnya tetap diteruskan.
        $tenantPermissions = match (TenantContext::active()->role()) {
            SchoolRole::ADMIN => ['school.manage', 'school.academic', 'school.report'],
            SchoolRole::STAFF => ['school.manage', 'school.academic', 'school.report'],
            SchoolRole::TEACHER => ['school.academic'],
            default => [],
        };

        $external = is_iterable($user->permissions ?? null) ? $user->permissions : [];
        $permissions = [];
        foreach (array_merge($tenantPermissions, array_column(is_object($external) ? (array) $external : $external, 'permission_name')) as $permission) {
            $permissions[$permission] = ['permission_name' => $permission, 'display_name' => $permission];
        }

        return array_values($permissions);
    }
}
