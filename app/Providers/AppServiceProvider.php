<?php

namespace App\Providers;

use App\Enums\SchoolRole;
use App\Models\User;
use App\Repositories\School\SchoolRepository;
use App\Repositories\School\SchoolRepositoryImplement;
use App\Repositories\Tenant\TenantRepository;
use App\Repositories\Tenant\TenantRepositoryImplement;
use App\Services\Tenancy\TenantContext;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SchoolRepository::class, SchoolRepositoryImplement::class);
        $this->app->bind(TenantRepository::class, TenantRepositoryImplement::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Permission dihitung dari peran keanggotaan pada sekolah aktif
        // (TenantContext). Tanpa konteks sekolah, semua Gate gagal
        // (fail-closed) — route ber-middleware can: otomatis 403.
        Gate::define('school.manage', fn (User $user): bool => in_array(
            TenantContext::active()->role(), [SchoolRole::ADMIN, SchoolRole::STAFF], true));
        Gate::define('school.academic', fn (User $user): bool => in_array(
            TenantContext::active()->role(), [SchoolRole::ADMIN, SchoolRole::STAFF, SchoolRole::TEACHER], true));
        Gate::define('school.report', fn (User $user): bool => in_array(
            TenantContext::active()->role(), [SchoolRole::ADMIN, SchoolRole::STAFF], true));
    }
}
