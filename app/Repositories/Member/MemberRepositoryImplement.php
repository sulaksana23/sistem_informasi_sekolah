<?php

namespace App\Repositories\Member;

use App\Models\SchoolMembership;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Itmm\EasyRepository\Implementations\Eloquent;

/**
 * SchoolMembership tidak memakai BelongsToTenant (dipakai untuk membentuk
 * konteks tenant), jadi setiap kueri di sini wajib memfilter school_id.
 */
class MemberRepositoryImplement extends Eloquent implements MemberRepository
{
    public function __construct(protected SchoolMembership $model) {}

    public function listForSchool(int $schoolId): array
    {
        return SchoolMembership::query()->with('user:id,name,email')
            ->where('school_id', $schoolId)
            ->orderBy('role')->orderBy('id')->get()
            ->map(fn (SchoolMembership $row) => [
                'id' => $row->id, 'user_id' => $row->user_id,
                'name' => $row->user?->name, 'email' => $row->user?->email,
                'role' => $row->role->value, 'role_label' => $row->role->label(),
                'joined_at' => $row->created_at?->format('Y-m-d'),
            ])->all();
    }

    public function findInSchool(int $schoolId, int $membershipId): ?SchoolMembership
    {
        return SchoolMembership::query()->where('school_id', $schoolId)->whereKey($membershipId)->first();
    }

    public function userIdByEmail(string $email): ?int
    {
        $id = User::query()->where('email', mb_strtolower(trim($email)))->value('id');

        return $id === null ? null : (int) $id;
    }

    public function isMember(int $schoolId, int $userId): bool
    {
        return SchoolMembership::query()->where('school_id', $schoolId)->where('user_id', $userId)->exists();
    }

    public function addMember(int $schoolId, int $userId, string $role): void
    {
        SchoolMembership::query()->create(['school_id' => $schoolId, 'user_id' => $userId, 'role' => $role]);
    }

    public function updateRole(SchoolMembership $membership, string $role): void
    {
        $membership->update(['role' => $role]);
    }

    public function removeMember(SchoolMembership $membership): void
    {
        DB::transaction(function () use ($membership) {
            // Profil guru di sekolah ini tidak lagi terhubung ke akun yang dicabut.
            Teacher::query()->where('user_id', $membership->user_id)->update(['user_id' => null]);
            $membership->delete();
        });
    }
}
