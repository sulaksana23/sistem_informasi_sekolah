<?php

namespace App\Repositories\Tenant;

use App\Models\School;
use App\Models\SchoolMembership;
use Itmm\EasyRepository\Implementations\Eloquent;
use Illuminate\Support\Facades\DB;

class TenantRepositoryImplement extends Eloquent implements TenantRepository
{
    public function __construct(protected School $model) {}

    public function listSchoolsForUser(int $userId): array
    {
        return DB::table('school_memberships')->join('schools', 'schools.id', 'school_memberships.school_id')
            ->where('school_memberships.user_id', $userId)
            ->orderBy('schools.name')
            ->get(['schools.id', 'schools.name', 'school_memberships.role'])
            ->map(fn ($row) => ['id' => $row->id, 'name' => $row->name, 'role' => $row->role])->all();
    }

    public function findMembership(int $userId, int $schoolId): ?array
    {
        $row = SchoolMembership::query()->where('user_id', $userId)->where('school_id', $schoolId)->first();

        return $row ? ['membership' => $row, 'school' => $row->school, 'role' => $row->role] : null;
    }

    public function createSchool(string $name): School
    {
        return DB::transaction(function () use ($name) {
            return School::query()->create(['name' => trim($name)]);
        });
    }

    public function attachMember(int $schoolId, int $userId, string $role): void
    {
        // Upsert supaya perintah operator aman dijalankan ulang.
        SchoolMembership::query()->updateOrCreate(
            ['school_id' => $schoolId, 'user_id' => $userId],
            ['role' => $role],
        );
    }

    public function updateMemberRole(int $schoolId, int $userId, string $role): void
    {
        SchoolMembership::query()->where('school_id', $schoolId)->where('user_id', $userId)
            ->update(['role' => $role]);
    }
}
