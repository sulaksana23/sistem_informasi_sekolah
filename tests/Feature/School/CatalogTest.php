<?php

namespace Tests\Feature\School;

use App\Enums\SchoolRole;
use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    /** @return array<string, array{0: string, 1: array<string, mixed>, 2: string}> */
    public static function sections(): array
    {
        return [
            'students' => ['students', ['student_number' => 'S-10', 'name' => 'Citra', 'gender' => 'female', 'status' => 'active'], 'students'],
            'teachers' => ['teachers', ['employee_number' => 'G-10', 'name' => 'Pak Dedi', 'status' => 'active'], 'teachers'],
            'classes' => ['classes', ['name' => 'XI IPS 2', 'grade_level' => 11, 'section' => 'IPS 2'], 'school_classes'],
            'subjects' => ['subjects', ['code' => 'BIN', 'name' => 'Bahasa Indonesia'], 'subjects'],
            'academic-years' => ['academic-years', ['name' => '2027/2028', 'starts_at' => '2027-07-01', 'ends_at' => '2028-06-30', 'is_active' => true], 'academic_years'],
        ];
    }

    #[DataProvider('sections')]
    public function test_admin_can_create_update_and_list_each_section(string $section, array $payload, string $table): void
    {
        $school = $this->newSchool();
        $this->actingAs($this->memberOf($school));

        $this->post(route('school.catalog.store', ['section' => $section]), $payload)
            ->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas($table, ['school_id' => $school->id, 'name' => $payload['name']]);

        $id = (int) DB::table($table)->where('school_id', $school->id)->value('id');
        $this->put(route('school.catalog.update', ['section' => $section, 'id' => $id]), [...$payload, 'name' => $payload['name'].' Baru'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas($table, ['id' => $id, 'name' => $payload['name'].' Baru']);

        $this->get(route("school.{$section}.index"))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('school/pages/SchoolCatalog')
            ->has('records', 1)
            ->where('pagination.total', 1));

        $this->delete(route('school.catalog.destroy', ['section' => $section, 'id' => $id]))->assertSessionHasNoErrors();
    }

    public function test_staff_can_manage_but_teacher_cannot(): void
    {
        $school = $this->newSchool();
        $this->actingAs($this->memberOf($school, SchoolRole::STAFF))
            ->get(route('school.students.index'))->assertOk();

        $this->actingAs($this->memberOf($school, SchoolRole::TEACHER))
            ->post(route('school.catalog.store', ['section' => 'students']), ['student_number' => 'S', 'name' => 'X', 'gender' => 'male', 'status' => 'active'])
            ->assertForbidden();
    }

    public function test_student_list_is_paginated_and_searchable_on_server(): void
    {
        $school = $this->newSchool();
        $this->inSchool($school, function () {
            foreach (range(1, 25) as $i) {
                Student::create(['student_number' => sprintf('S-%03d', $i), 'name' => "Siswa {$i}", 'gender' => 'male', 'status' => 'active']);
            }
        });
        $this->actingAs($this->memberOf($school));

        $this->get(route('school.students.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('records', 20)->where('pagination.total', 25)->where('pagination.last_page', 2));
        $this->get(route('school.students.index', ['page' => 2]))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('records', 5)->where('pagination.current_page', 2));
        $this->get(route('school.students.index', ['search' => 'S-007']))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('records', 1)->where('records.0.name', 'Siswa 7')->where('search', 'S-007'));
    }

    public function test_deleting_student_is_soft_delete(): void
    {
        $school = $this->newSchool();
        $student = $this->inSchool($school, fn () => Student::create(['student_number' => 'S-1', 'name' => 'Andi', 'gender' => 'male', 'status' => 'active']));
        $this->actingAs($this->memberOf($school));

        $this->delete(route('school.catalog.destroy', ['section' => 'students', 'id' => $student->id]))->assertSessionHasNoErrors();

        $this->assertSoftDeleted('students', ['id' => $student->id]);
    }

    public function test_student_with_enrollment_cannot_be_deleted(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school));

        $this->delete(route('school.catalog.destroy', ['section' => 'students', 'id' => $data['students'][0]->id]))
            ->assertSessionHasErrors('record');
        $this->assertNotSoftDeleted('students', ['id' => $data['students'][0]->id]);
    }

    public function test_only_one_academic_year_stays_active(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school));

        $this->post(route('school.catalog.store', ['section' => 'academic-years']), [
            'name' => '2027/2028', 'starts_at' => '2027-07-01', 'ends_at' => '2028-06-30', 'is_active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertFalse($data['year']->fresh()->is_active);
        $this->assertSame(1, $this->inSchool($school, fn () => AcademicYear::query()->where('is_active', true)->count()));
    }

    public function test_teacher_profile_can_only_link_teacher_member_of_active_school(): void
    {
        $school = $this->newSchool();
        $outsider = $this->memberOf($this->newSchool(), SchoolRole::TEACHER);
        $teacherUser = $this->memberOf($school, SchoolRole::TEACHER);
        $this->actingAs($this->memberOf($school));
        $payload = ['employee_number' => 'G-9', 'name' => 'Guru', 'status' => 'active'];

        $this->post(route('school.catalog.store', ['section' => 'teachers']), [...$payload, 'user_id' => $outsider->id])
            ->assertSessionHasErrors('user_id');
        $this->post(route('school.catalog.store', ['section' => 'teachers']), [...$payload, 'user_id' => $teacherUser->id])
            ->assertSessionHasNoErrors();
    }

    public function test_duplicate_student_number_is_rejected_within_school_only(): void
    {
        $school = $this->newSchool();
        $other = $this->newSchool();
        $this->inSchool($other, fn () => Student::create(['student_number' => 'S-1', 'name' => 'Lain', 'gender' => 'male', 'status' => 'active']));
        $this->actingAs($this->memberOf($school));
        $payload = ['student_number' => 'S-1', 'name' => 'Andi', 'gender' => 'male', 'status' => 'active'];

        $this->post(route('school.catalog.store', ['section' => 'students']), $payload)->assertSessionHasNoErrors();
        $this->post(route('school.catalog.store', ['section' => 'students']), $payload)->assertSessionHasErrors('student_number');
    }
}
