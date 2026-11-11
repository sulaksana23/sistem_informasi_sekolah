<?php

namespace App\Repositories\Tenant;

use App\Models\School;
use Itmm\EasyRepository\Repository;

interface TenantRepository extends Repository
{
    public function listSchoolsForUser(int $userId): array;

    public function findMembership(int $userId, int $schoolId): ?array;

    public function createSchool(string $name): School;

    public function attachMember(int $schoolId, int $userId, string $role): void;

    public function updateMemberRole(int $schoolId, int $userId, string $role): void;
}
