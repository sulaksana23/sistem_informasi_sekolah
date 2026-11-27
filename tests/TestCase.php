<?php

namespace Tests;

use App\Enums\SchoolRole;
use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolMembership;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Services\Tenancy\TenantContext;
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

    protected function newSchool(): School
    {
        return School::create(['name' => 'Sekolah Uji '.uniqid()]);
    }

    /** Buat akun anggota sekolah dengan peran tertentu. */
    protected function memberOf(School $school, SchoolRole $role = SchoolRole::ADMIN): User
    {
        $user = User::factory()->create();
        SchoolMembership::create(['school_id' => $school->id, 'user_id' => $user->id, 'role' => $role]);

        return $user;
    }

    /**
     * Jalankan $callback dengan konteks tenant $school (untuk menyiapkan data
     * yang ber-trait BelongsToTenant), lalu kosongkan konteks lagi.
     */
    protected function inSchool(School $school, callable $callback): mixed
    {
        TenantContext::active()->set($school, SchoolRole::ADMIN);
        try {
            return $callback();
        } finally {
            TenantContext::active()->clear();
        }
    }

    /**
     * Data akademik minimal: tahun ajaran aktif, kelas, mapel, guru (tertaut
     * ke $teacherUser bila ada), dua siswa yang ditempatkan, dan penugasan.
     *
     * @return array{year: AcademicYear, class: SchoolClass, subject: Subject, teacher: Teacher, students: array<int, Student>, enrollments: array<int, StudentEnrollment>, assignment: TeacherAssignment}
     */
    protected function seedAcademic(School $school, ?User $teacherUser = null): array
    {
        return $this->inSchool($school, function () use ($teacherUser) {
            $year = AcademicYear::create(['name' => '2026/2027', 'starts_at' => '2026-07-01', 'ends_at' => '2027-06-30', 'is_active' => true]);
            $class = SchoolClass::create(['name' => 'X IPA 1', 'grade_level' => 10, 'section' => 'IPA 1']);
            $subject = Subject::create(['code' => 'MTK', 'name' => 'Matematika']);
            $teacher = Teacher::create(['employee_number' => 'G-1', 'name' => 'Bu Guru', 'status' => 'active', 'user_id' => $teacherUser?->id]);
            $students = [];
            $enrollments = [];
            foreach (['S-1' => 'Andi', 'S-2' => 'Budi'] as $number => $name) {
                $student = Student::create(['student_number' => $number, 'name' => $name, 'gender' => 'male', 'status' => 'active']);
                $students[] = $student;
                $enrollments[] = StudentEnrollment::create([
                    'student_id' => $student->id, 'school_class_id' => $class->id, 'academic_year_id' => $year->id,
                    'enrolled_at' => '2026-07-15', 'status' => 'active',
                ]);
            }
            $assignment = TeacherAssignment::create([
                'teacher_id' => $teacher->id, 'school_class_id' => $class->id, 'subject_id' => $subject->id, 'academic_year_id' => $year->id,
            ]);

            return compact('year', 'class', 'subject', 'teacher', 'students', 'enrollments', 'assignment');
        });
    }
}
