<?php

namespace App\Services\Tenancy;

use App\Enums\SchoolRole;
use App\Exceptions\BusinessException;
use App\Models\School;
use Illuminate\Container\Container;
use Illuminate\Http\Request;

/**
 * Konteks sekolah aktif untuk request yang lagi berjalan. State disimpan di
 * attributes objek Request (binding 'request' di container selalu diganti
 * Laravel per request/worker), jadi tidak ada state yang bocor antar request.
 * Deny-by-default: tanpa set(), schoolId() = null dan role() = null, sehingga
 * kueri model sekolah kosong dan Gate permission selalu gagal.
 */
final class TenantContext
{
    public const ATTR_SCHOOL = 'tenant.school';
    public const ATTR_ROLE = 'tenant.role';
    public const ATTR_MEMBERSHIPS = 'tenant.memberships';

    /** Akses konteks yang scope-nya request aktif. */
    public static function active(): self
    {
        $request = Container::getInstance()->make(Request::class);

        return new self($request);
    }

    public function __construct(protected Request $request) {}

    public function set(School $school, SchoolRole $role): void
    {
        $this->request->attributes->set(self::ATTR_SCHOOL, $school);
        $this->request->attributes->set(self::ATTR_ROLE, $role);
    }

    public function clear(): void
    {
        $this->request->attributes->remove(self::ATTR_SCHOOL);
        $this->request->attributes->remove(self::ATTR_ROLE);
    }

    public function school(): ?School
    {
        return $this->request->attributes->get(self::ATTR_SCHOOL);
    }

    public function schoolId(): ?int
    {
        return $this->school()?->id;
    }

    public function role(): ?SchoolRole
    {
        return $this->request->attributes->get(self::ATTR_ROLE);
    }

    public function requireSchoolId(): int
    {
        $schoolId = $this->schoolId();
        if ($schoolId === null) {
            throw new BusinessException('Sekolah aktif tidak ditemukan.', 403);
        }

        return $schoolId;
    }

    /** Daftar keanggotaan user aktif: [[id, name, role], ...] atau null. */
    public function memberships(): ?array
    {
        return $this->request->attributes->get(self::ATTR_MEMBERSHIPS);
    }

    public function setMemberships(?array $memberships): void
    {
        $this->request->attributes->set(self::ATTR_MEMBERSHIPS, $memberships);
    }

    /** Shared props Inertia: sekolah aktif + daftar sekolah tergabung user. */
    public function snapshot(): array
    {
        $current = $this->school() === null ? null : [
            'id' => $this->school()->id, 'name' => $this->school()->name, 'role' => $this->role()?->value,
        ];

        return [
            'current_school' => $current,
            'schools' => array_values(array_map(
                fn (array $row) => ['id' => (int) $row['id'], 'name' => $row['name'], 'role' => $row['role'],
                    'is_current' => $current !== null && (int) $row['id'] === $current['id']],
                $this->memberships() ?? [],
            )),
        ];
    }
}
