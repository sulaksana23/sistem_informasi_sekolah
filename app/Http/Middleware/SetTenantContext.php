<?php

namespace App\Http\Middleware;

use App\Services\Tenancy\TenantContext;
use App\Services\Tenancy\TenantService;
use Closure;
use Illuminate\Http\Request;

/**
 * Memasang konteks sekolah aktif untuk request yang terautentikasi.
 * Fail-closed: hanya keanggotaan yang sah (school_memberships) yang boleh
 * membentuk konteks; tanpa konteks, semua kueri data sekolah kosong dan
 * permission Gate bernilai false.
 */
class SetTenantContext
{
    /** Route yang jalan tanpa keanggotaan sekolah. */
    private const EXCEPT_ROUTES = ['tenant.no-school', 'tenant.current.store'];

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user === null) {
            TenantContext::active()->clear();
            TenantContext::active()->setMemberships(null);

            return $next($request);
        }

        $memberships = TenantService::membershipsForUser($user->id);
        TenantContext::active()->setMemberships($memberships);

        if ($memberships === []) {
            TenantContext::active()->clear();

            if ($request->routeIs(...self::EXCEPT_ROUTES)) {
                return $next($request);
            }

            return redirect()->route('tenant.no-school')
                ->with('error', 'Akun Anda belum tergabung di sekolah mana pun.');
        }

        $requestedSchoolId = (int) $request->session()->get('current_school_id', 0);
        $membership = collect($memberships)
            ->first(fn (array $row) => (int) $row['id'] === $requestedSchoolId)
            ?? $memberships[0];
        $request->session()->put('current_school_id', $membership['id']);

        $verified = TenantService::membershipFor($user->id, $membership['id']);
        TenantContext::active()->set($verified['school'], $verified['role']);

        if ($request->routeIs('tenant.no-school')) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
