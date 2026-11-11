<?php

namespace Tests\Feature\School;

use App\Enums\SchoolRole;
use App\Models\School;
use App\Models\SchoolMembership;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * Profil sekolah: semua anggota boleh melihat, hanya pemegang `school.manage`
 * (admin/staff) yang boleh mengubah, dan perubahan tidak boleh menabrak
 * sekolah lain (nama & NPSN unik lintas tenant).
 */
class SchoolProfileTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    /** Sekolah tempat user yang sedang login menjadi anggota. */
    private function memberSchool(): School
    {
        return SchoolMembership::query()
            ->where('user_id', Auth::id())
            ->firstOrFail()
            ->school;
    }

    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'SMA Negeri 1 Uji',
            'npsn' => '12345678',
            'level' => 'sma',
            'status' => 'negeri',
            'accreditation' => 'A',
            'address' => 'Jalan Pendidikan 1',
            'phone' => '0361-123456',
            'email' => 'info@sman1uji.sch.id',
            'website' => 'https://sman1uji.sch.id',
            'headmaster_name' => 'I Made Wirawan',
            'founded_year' => 1990,
            'description' => 'Sekolah uji profil.',
            ...$overrides,
        ];
    }

    public function test_page_renders_for_member(): void
    {
        $this->actingAsSchoolMember()
            ->get(route('school.profile.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('school/pages/SchoolProfile')
                ->has('profile', fn (AssertableInertia $profile) => $profile
                    ->hasAll(['id', 'name', 'npsn', 'level', 'level_label', 'status', 'status_label',
                        'accreditation', 'address', 'phone', 'email', 'website', 'headmaster_name',
                        'founded_year', 'description', 'created_at', 'member_count', 'student_count',
                        'teacher_count'])
                    ->etc()));
    }

    public function test_teacher_can_view_but_not_update(): void
    {
        $this->actingAsSchoolMember(SchoolRole::TEACHER)
            ->get(route('school.profile.index'))
            ->assertOk();

        $this->put(route('school.profile.update'), $this->validPayload())
            ->assertForbidden();
    }

    public function test_admin_updates_profile(): void
    {
        $this->actingAsSchoolMember();
        $schoolId = $this->memberSchool()->id;

        $this->put(route('school.profile.update'), $this->validPayload())
            ->assertRedirect(route('school.profile.index'))
            ->assertSessionHas('success');

        $school = School::query()->findOrFail($schoolId);

        $this->assertSame('SMA Negeri 1 Uji', $school->name);
        $this->assertSame('12345678', $school->npsn);
        $this->assertSame('sma', $school->level?->value);
        $this->assertSame('negeri', $school->status?->value);
        $this->assertSame('A', $school->accreditation);
        $this->assertSame(1990, (int) $school->founded_year);
    }

    public function test_blank_optional_fields_are_stored_as_null(): void
    {
        $this->actingAsSchoolMember()
            ->put(route('school.profile.update'), $this->validPayload([
                'npsn' => '',
                'address' => '',
                'phone' => '',
                'website' => '',
                'founded_year' => '',
                'description' => '',
            ]))
            ->assertRedirect(route('school.profile.index'));

        $school = $this->memberSchool()->fresh();

        $this->assertNull($school->npsn);
        $this->assertNull($school->address);
        $this->assertNull($school->phone);
        $this->assertNull($school->website);
        $this->assertNull($school->founded_year);
        $this->assertNull($school->description);
    }

    public function test_validation_rejects_duplicate_name_and_npsn(): void
    {
        $other = School::create(['name' => 'Sekolah Lain', 'npsn' => '99999999']);

        $this->actingAsSchoolMember()
            ->put(route('school.profile.update'), $this->validPayload([
                'name' => $other->name,
                'npsn' => $other->npsn,
                'website' => 'bukan-url',
            ]))
            ->assertSessionHasErrors(['name', 'npsn', 'website']);
    }
}
