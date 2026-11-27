<?php

namespace Tests\Feature\School;

use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RelationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_enroll_student_and_delete_enrollment(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $student = $this->inSchool($school, fn () => Student::create(['student_number' => 'S-9', 'name' => 'Citra', 'gender' => 'female', 'status' => 'active']));
        $this->actingAs($this->memberOf($school));

        $this->get(route('school.enrollments.index'))->assertOk();
        $this->post(route('school.enrollments.store'), [
            'student_id' => $student->id, 'school_class_id' => $data['class']->id, 'academic_year_id' => $data['year']->id,
            'enrolled_at' => '2026-07-20', 'status' => 'active',
        ])->assertSessionHasNoErrors();
        $enrollmentId = DB::table('student_enrollments')->where('student_id', $student->id)->value('id');
        $this->assertNotNull($enrollmentId);

        $this->delete(route('school.enrollments.destroy', ['id' => $enrollmentId]))->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('student_enrollments', ['id' => $enrollmentId]);
    }

    public function test_enrollment_rejects_references_from_another_school(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $foreign = $this->inSchool($this->newSchool(), fn () => Student::create(['student_number' => 'X', 'name' => 'Asing', 'gender' => 'male', 'status' => 'active']));
        $this->actingAs($this->memberOf($school));

        $this->post(route('school.enrollments.store'), [
            'student_id' => $foreign->id, 'school_class_id' => $data['class']->id, 'academic_year_id' => $data['year']->id,
            'enrolled_at' => '2026-07-20', 'status' => 'active',
        ])->assertSessionHasErrors('student_id');
    }

    public function test_admin_can_assign_teacher_and_remove_assignment(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $teacher = $this->inSchool($school, fn () => Teacher::create(['employee_number' => 'G-2', 'name' => 'Pak Eko', 'status' => 'active']));
        $this->actingAs($this->memberOf($school));

        $this->get(route('school.teacher-assignments.index'))->assertOk();
        $this->post(route('school.teacher-assignments.store'), [
            'teacher_id' => $teacher->id, 'school_class_id' => $data['class']->id,
            'subject_id' => $data['subject']->id, 'academic_year_id' => $data['year']->id,
        ])->assertSessionHasNoErrors();
        $id = DB::table('teacher_assignments')->where('teacher_id', $teacher->id)->value('id');

        $this->delete(route('school.teacher-assignments.destroy', ['id' => $id]))->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('teacher_assignments', ['id' => $id]);
    }
}
