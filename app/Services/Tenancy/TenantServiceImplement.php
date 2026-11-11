<?php

namespace App\Services\Tenancy;

use App\Enums\SchoolRole;
use App\Exceptions\BusinessException;
use App\Models\School;
use App\Repositories\Tenant\TenantRepository;
use Itmm\EasyRepository\Service;

class TenantServiceImplement extends Service
{
    public function __construct(protected TenantRepository $mainRepository) {}

    public function membershipsForUser(int $userId): array
    {
        return $this->mainRepository->listSchoolsForUser($userId);
    }

    public function requireActiveSchoolId(): int
    {
        return TenantContext::active()->requireSchoolId();
    }

    public function membershipFor(int $userId, int $schoolId): array
    {
        $membership = $this->mainRepository->findMembership($userId, $schoolId);
        if ($membership === null) {
            throw new BusinessException('Anda bukan anggota sekolah tersebut.', 403);
        }

        return $membership;
    }

    public function createSchool(string $name): School
    {
        if (trim($name) === '') {
            throw new BusinessException('Nama sekolah wajib diisi.');
        }

        return $this->mainRepository->createSchool($name);
    }

    public function assignMember(int $userId, int $schoolId, SchoolRole $role): void
    {
        $this->mainRepository->attachMember($schoolId, $userId, $role->value);
    }

    public function setMemberRole(int $userId, int $schoolId, SchoolRole $role): void
    {
        if ($this->mainRepository->findMembership($userId, $schoolId) === null) {
            throw new BusinessException('Anggota dengan email tersebut belum terdaftar di sekolah ini.');
        }

        $this->mainRepository->updateMemberRole($schoolId, $userId, $role->value);
    }
}
