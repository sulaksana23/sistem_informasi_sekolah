<?php

namespace App\Models\Concerns;

use App\Services\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Semua entitas milik satu sekolah memakai trait ini: kueri otomatis
 * dipagasi ke sekolah aktif, dan penulisan baru selalu ditandai dengan
 * school_id sekolah aktif. Bila tidak ada konteks sekolah (misalnya
 * request tanpa keanggotaan), semua kueri mengembalikan nol baris dan
 * penulisan ditolak — enforcement fail-closed.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $query): void {
            $column = (new static)->getTable().'.school_id';
            $schoolId = TenantContext::active()->schoolId();

            $schoolId === null
                ? $query->whereRaw('1 = 0')
                : $query->where($column, $schoolId);
        });

        static::creating(function (self $model): void {
            $model->school_id ??= TenantContext::active()->requireSchoolId();
        });
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
