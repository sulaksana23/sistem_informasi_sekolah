<?php

namespace Tests\Feature\Member;

use App\Enums\SchoolRole;
use App\Models\SchoolMembership;
use App\Models\Teacher;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MemberTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_only_admin_can_open_member_page(): void
    {
        $school = $this->newSchool();
        $admin = $this->memberOf($school);

        $this->actingAs($admin)->get(route('school.members.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('member/pages/MemberIndex')->has('members', 1)->has('roles', 3)
            ->where('auth.permissions', fn ($permissions) => collect($permissions)->pluck('permission_name')->contains('school.members')));

        $this->actingAs($this->memberOf($school, SchoolRole::STAFF))->get(route('school.members.index'))->assertForbidden();
        $this->actingAs($this->memberOf($school, SchoolRole::TEACHER))->get(route('school.members.index'))->assertForbidden();
    }

    public function test_admin_adds_registered_account_by_email(): void
    {
        $school = $this->newSchool();
        $target = User::factory()->create(['email' => 'guru.baru@example.test']);
        $this->actingAs($this->memberOf($school));

        $this->post(route('school.members.store'), ['email' => ' Guru.Baru@example.test ', 'role' => 'teacher'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('school_memberships', ['school_id' => $school->id, 'user_id' => $target->id, 'role' => 'teacher']);

        $this->post(route('school.members.store'), ['email' => 'guru.baru@example.test', 'role' => 'staff'])
            ->assertSessionHasErrors('email');
        $this->post(route('school.members.store'), ['email' => 'belum-daftar@example.test', 'role' => 'staff'])
            ->assertSessionHasErrors('email');
        $this->post(route('school.members.store'), ['email' => 'guru.baru@example.test', 'role' => 'superadmin'])
            ->assertSessionHasErrors('role');
    }

    public function test_admin_changes_role_and_removes_member(): void
    {
        $school = $this->newSchool();
        $member = $this->memberOf($school, SchoolRole::TEACHER);
        $membership = SchoolMembership::query()->where('user_id', $member->id)->firstOrFail();
        $teacher = $this->inSchool($school, fn () => Teacher::create(['employee_number' => 'G-1', 'name' => 'Guru', 'status' => 'active', 'user_id' => $member->id]));
        $this->actingAs($this->memberOf($school));

        $this->put(route('school.members.update', ['id' => $membership->id]), ['role' => 'staff'])->assertSessionHasNoErrors();
        $this->assertSame(SchoolRole::STAFF, $membership->fresh()->role);

        $this->delete(route('school.members.destroy', ['id' => $membership->id]))->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('school_memberships', ['id' => $membership->id]);
        $this->assertNull($teacher->fresh()->user_id);
    }

    public function test_admin_cannot_change_or_remove_own_membership(): void
    {
        $school = $this->newSchool();
        $admin = $this->memberOf($school);
        $own = SchoolMembership::query()->where('user_id', $admin->id)->firstOrFail();
        $this->actingAs($admin);

        $this->put(route('school.members.update', ['id' => $own->id]), ['role' => 'teacher'])->assertSessionHasErrors('record');
        $this->delete(route('school.members.destroy', ['id' => $own->id]))->assertSessionHasErrors('record');
        $this->assertSame(SchoolRole::ADMIN, $own->fresh()->role);
    }

    public function test_membership_of_another_school_is_not_reachable(): void
    {
        $other = $this->newSchool();
        $foreign = SchoolMembership::query()->where('user_id', $this->memberOf($other, SchoolRole::TEACHER)->id)->firstOrFail();
        $this->actingAs($this->memberOf($this->newSchool()));

        $this->put(route('school.members.update', ['id' => $foreign->id]), ['role' => 'admin'])->assertNotFound();
        $this->delete(route('school.members.destroy', ['id' => $foreign->id]))->assertNotFound();
        $this->assertSame(SchoolRole::TEACHER, $foreign->fresh()->role);
    }
}
