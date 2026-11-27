<?php

namespace App\Services\Member;

use App\Enums\SchoolRole;
use App\Models\SchoolMembership;
use App\Repositories\Member\MemberRepository;
use App\Services\Tenancy\TenantContext;
use Illuminate\Validation\ValidationException;
use Itmm\EasyRepository\Service;

/**
 * Kelola anggota sekolah aktif dari UI (pengganti school:assign-member untuk
 * pekerjaan sehari-hari). Admin tidak bisa mengubah/mencabut keanggotaannya
 * sendiri, sehingga sekolah selalu menyisakan minimal satu admin.
 */
class MemberServiceImplement extends Service
{
    public function __construct(protected MemberRepository $mainRepository) {}

    public function page(): array
    {
        return [
            'members' => $this->mainRepository->listForSchool(TenantContext::active()->requireSchoolId()),
            'roles' => collect(SchoolRole::cases())->map(fn (SchoolRole $role) => [
                'value' => $role->value, 'label' => $role->label(),
            ])->all(),
        ];
    }

    public function add(string $email, SchoolRole $role): void
    {
        $schoolId = TenantContext::active()->requireSchoolId();
        $userId = $this->mainRepository->userIdByEmail($email);
        if ($userId === null) {
            throw ValidationException::withMessages(['email' => 'Akun dengan email ini belum terdaftar. Minta pengguna mendaftar terlebih dahulu.']);
        }
        if ($this->mainRepository->isMember($schoolId, $userId)) {
            throw ValidationException::withMessages(['email' => 'Akun ini sudah menjadi anggota sekolah.']);
        }
        $this->mainRepository->addMember($schoolId, $userId, $role->value);
    }

    public function changeRole(int $actorId, int $membershipId, SchoolRole $role): void
    {
        $membership = $this->editable($actorId, $membershipId);
        $this->mainRepository->updateRole($membership, $role->value);
    }

    public function remove(int $actorId, int $membershipId): void
    {
        $membership = $this->editable($actorId, $membershipId);
        $this->mainRepository->removeMember($membership);
    }

    private function editable(int $actorId, int $membershipId): SchoolMembership
    {
        $membership = $this->mainRepository->findInSchool(TenantContext::active()->requireSchoolId(), $membershipId);
        abort_if($membership === null, 404);
        if ($membership->user_id === $actorId) {
            throw ValidationException::withMessages(['record' => 'Anda tidak dapat mengubah atau mencabut keanggotaan Anda sendiri.']);
        }

        return $membership;
    }
}
