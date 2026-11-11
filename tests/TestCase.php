<?php

namespace Tests;

use App\Enums\SchoolRole;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Login sebagai anggota sekolah aktif. Permission project berasal dari
     * peran keanggotaan (SchoolRole), bukan daftar permission terpisah.
     */
    protected function actingAsSchoolMember(SchoolRole $role = SchoolRole::ADMIN): static
    {
        $user = User::factory()->create();
        $school = School::create(['name' => 'Sekolah Uji '.uniqid()]);
        SchoolMembership::create(['school_id' => $school->id, 'user_id' => $user->id, 'role' => $role]);

        return $this->actingAs($user);
    }
}
