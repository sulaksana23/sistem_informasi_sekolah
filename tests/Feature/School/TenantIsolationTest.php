<?php

namespace Tests\Feature\School;

use App\Enums\SchoolRole;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Services\Tenancy\TenantContext;
use Tests\TestCase;

/**
 * Tenant isolation is the core security property of this app: data queries are
 * scoped to the active school and Gates fail closed without a verified
 * membership. Each test pins one of those guarantees end to end over HTTP.
 */
class TenantIsolationTest extends TestCase
{
    public function test_data_from_another_school_is_not_reachable(): void
    {
        $this->actingAsSchoolMember();

        $other = School::create(['name' => 'Sekolah Lain '.uniqid()]);
        TenantContext::active()->set($other, SchoolRole::ADMIN);
        $foreign = Student::create([
            'student_number' => 'X-1', 'name' => 'Siswa Lain',
            'gender' => 'male', 'status' => 'active',
        ]);
        TenantContext::active()->clear();

        $this->put(route('school.catalog.update', ['section' => 'students', 'id' => $foreign->id]), [
            'student_number' => 'X-1', 'name' => 'Diubah',
            'gender' => 'male', 'status' => 'active',
        ])->assertNotFound();
    }

    public function test_teacher_cannot_open_management_routes(): void
    {
        $this->actingAsSchoolMember(SchoolRole::TEACHER)
            ->get(route('school.master-data.index'))
            ->assertForbidden();
    }

    public function test_user_without_membership_is_sent_to_no_school(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertRedirect(route('tenant.no-school'));
    }
}
