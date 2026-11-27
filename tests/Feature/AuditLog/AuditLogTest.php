<?php

namespace Tests\Feature\AuditLog;

use App\Enums\SchoolRole;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_manager_sees_audit_logs_of_active_school_only(): void
    {
        $school = $this->newSchool();
        $data = $this->seedAcademic($school);
        $admin = $this->memberOf($school);
        $this->actingAs($admin)->post(route('school.attendance.store'), [
            'school_class_id' => $data['class']->id, 'academic_year_id' => $data['year']->id, 'attendance_date' => now()->toDateString(),
            'students' => array_map(fn ($e) => ['enrollment_id' => $e->id, 'status' => 'present'], $data['enrollments']),
        ])->assertSessionHasNoErrors();

        $this->get(route('school.audit-logs.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('audit-log/pages/AuditLogIndex')
            ->has('logs', 2)
            ->where('logs.0.user_name', $admin->name)
            ->where('logs.0.type', 'attendance')
            ->where('pagination.total', 2));

        $this->get(route('school.audit-logs.index', ['type' => 'grade']))->assertInertia(fn (AssertableInertia $page) => $page->has('logs', 0));
        $this->get(route('school.audit-logs.index', ['type' => 'users']))->assertSessionHasErrors('type');

        // Sekolah lain tidak melihat log ini.
        $this->actingAs($this->memberOf($this->newSchool()))
            ->get(route('school.audit-logs.index'))->assertInertia(fn (AssertableInertia $page) => $page->has('logs', 0));
    }

    public function test_teacher_cannot_open_audit_logs(): void
    {
        $this->actingAs($this->memberOf($this->newSchool(), SchoolRole::TEACHER))
            ->get(route('school.audit-logs.index'))->assertForbidden();
    }
}
