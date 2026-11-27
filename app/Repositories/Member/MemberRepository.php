<?php

namespace App\Repositories\Member;

use App\Models\SchoolMembership;
use Itmm\EasyRepository\Repository;

interface MemberRepository extends Repository
{
    /** @return array<int, array<string, mixed>> */
    public function listForSchool(int $schoolId): array;

    public function findInSchool(int $schoolId, int $membershipId): ?SchoolMembership;

    public function userIdByEmail(string $email): ?int;

    public function isMember(int $schoolId, int $userId): bool;

    public function addMember(int $schoolId, int $userId, string $role): void;

    public function updateRole(SchoolMembership $membership, string $role): void;

    public function removeMember(SchoolMembership $membership): void;
}
