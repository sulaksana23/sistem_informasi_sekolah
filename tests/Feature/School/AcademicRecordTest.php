<?php

namespace Tests\Feature\School;

use App\Enums\SchoolRole;
use App\Models\AuditLog;
use App\Models\Grade;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/** Absensi & nilai: akses per peran/penugasan, validasi roster, dan audit log. */
class AcademicRecordTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function attendancePayload(array $data, string $status = 'present'): array
    {
        return [
            'school_class_id' => $data['class']->id, 'academic_year_id' => $data['year']->id,
            'attendance_date' => now()->toDateString(),
            'students' => array_map(fn ($e) => ['enrollment_id' => $e->id, 'status' => $status, 'note' => ''], $data['enrollments']),
        ];
    }

    private function gradePayload(array $data, $score = 80): array
    {
        return [
            'school_class_id' => $data['class']->id, 'academic_year_id' => $data['year']->id, 'subject_id' => $data['subject']->id,
            'assessment_name' => 'UH 1', 'assessment_date' => now()->toDateString(), 'max_score' => 100,
            'students' => array_map(fn ($e) => ['enrollment_id' => $e->id, 'score' => $score, 'note' => ''], $data['enrollments']),
        ];
    }

    public function test_admin_records_attendance_and_changes_are_audited(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $admin = $this->memberOf($school);
        $this->actingAs($admin);

        $this->get(route('school.attendance.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('school/pages/SchoolAttendance')->has('students', 2));

        $this->post(route('school.attendance.store'), $this->attendancePayload($data))->assertSessionHasNoErrors();
        $this->assertSame(2, DB::table('attendances')->count());
        $this->assertSame(2, DB::table('audit_logs')->where('event', 'created')->where('auditable_type', 'attendance')->count());

        // Simpan ulang tanpa perubahan: tidak menambah log.
        $this->post(route('school.attendance.store'), $this->attendancePayload($data))->assertSessionHasNoErrors();
        $this->assertSame(2, DB::table('audit_logs')->count());

        $payload = $this->attendancePayload($data);
        $payload['students'][0]['status'] = 'sick';
        $this->post(route('school.attendance.store'), $payload)->assertSessionHasNoErrors();

        $log = DB::table('audit_logs')->where('event', 'updated')->first();
        $this->assertNotNull($log);
        $this->assertSame($admin->id, (int) $log->user_id);
        $this->assertSame('present', json_decode($log->old_values, true)['status']);
        $this->assertSame('sick', json_decode($log->new_values, true)['status']);
    }

    public function test_attendance_rejects_stale_roster(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school));
        $payload = $this->attendancePayload($data);
        array_pop($payload['students']);

        $this->post(route('school.attendance.store'), $payload)->assertSessionHasErrors('students');
    }

    public function test_assigned_teacher_can_record_but_unassigned_teacher_cannot(): void
    {
        $school = $this->newSchool();
        $assignedUser = $this->memberOf($school, SchoolRole::TEACHER);
        $data = $this->seedAcademic($school, $assignedUser);

        $this->actingAs($assignedUser)
            ->post(route('school.grades.store'), $this->gradePayload($data))->assertSessionHasNoErrors();
        $this->assertSame(2, DB::table('grades')->count());

        $this->actingAs($this->memberOf($school, SchoolRole::TEACHER))
            ->post(route('school.attendance.store'), $this->attendancePayload($data))->assertForbidden();
    }

    public function test_grade_above_max_score_is_rejected(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school));

        $this->post(route('school.grades.store'), $this->gradePayload($data, 120))->assertSessionHasErrors('students');
        $this->assertSame(0, DB::table('grades')->count());
    }

    public function test_grade_correction_keeps_old_and_new_value_in_audit_log(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school));

        $this->get(route('school.grades.index'))->assertOk();
        $this->post(route('school.grades.store'), $this->gradePayload($data, 70))->assertSessionHasNoErrors();
        $this->post(route('school.grades.store'), $this->gradePayload($data, 85))->assertSessionHasNoErrors();

        $gradeId = $this->inSchool($school, fn () => Grade::query()->where('student_enrollment_id', $data['enrollments'][0]->id)->value('id'));
        $logs = $this->inSchool($school, fn () => AuditLog::query()->where('auditable_type', 'grade')->where('auditable_id', $gradeId)->orderBy('id')->get());
        $this->assertCount(2, $logs);
        $this->assertSame(70.0, (float) $logs[1]->old_values['score']);
        $this->assertSame(85.0, (float) $logs[1]->new_values['score']);
    }

    public function test_report_summarises_attendance_and_scores_for_staff_only(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $this->actingAs($this->memberOf($school, SchoolRole::STAFF));
        $this->post(route('school.attendance.store'), $this->attendancePayload($data))->assertSessionHasNoErrors();
        $this->post(route('school.grades.store'), $this->gradePayload($data, 90))->assertSessionHasNoErrors();

        $this->get(route('school.reports.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('school/pages/SchoolReports')
            ->where('summary.students', 2)
            ->where('summary.present_records', 2)
            ->where('summary.average_score', fn ($value) => (float) $value === 90.0));

        $this->actingAs($this->memberOf($school, SchoolRole::TEACHER))
            ->get(route('school.reports.index'))->assertForbidden();
    }

    public function test_dashboard_counts_only_active_school_data(): void
    {
        $school = $this->newSchool();
        $this->seedAcademic($school);
        $this->seedAcademic($this->newSchool());

        $this->actingAs($this->memberOf($school, SchoolRole::TEACHER))
            ->get(route('dashboard'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('stats.students', 2)->where('stats.teachers', 1));
    }
}
