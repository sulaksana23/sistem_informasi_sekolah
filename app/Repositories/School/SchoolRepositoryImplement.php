<?php

namespace App\Repositories\School;

use App\Enums\AttendanceStatus;
use App\Enums\SchoolRole;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Services\Tenancy\TenantContext;
use Itmm\EasyRepository\Implementations\Eloquent;
use Illuminate\Support\Facades\DB;

class SchoolRepositoryImplement extends Eloquent implements SchoolRepository
{
    private const CATALOGS = [
        'students' => Student::class,
        'teachers' => Teacher::class,
        'classes' => SchoolClass::class,
        'subjects' => Subject::class,
        'academic-years' => AcademicYear::class,
    ];

    public function __construct(protected Student $model) {}

    public function classSectionExists(int $gradeLevel, string $section, ?int $exceptId = null): bool
    {
        return SchoolClass::query()->where('grade_level', $gradeLevel)->where('section', $section)
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))->exists();
    }

    public function catalogRecords(string $section): array
    {
        $records = match ($section) {
            'students' => Student::query()->orderBy('student_number')->get()->map(fn (Student $row) => [
                'id' => $row->id, 'student_number' => $row->student_number, 'nisn' => $row->nisn,
                'name' => $row->name, 'gender' => $row->gender->value, 'gender_label' => $row->gender->label(),
                'birth_date' => $row->birth_date?->format('Y-m-d'), 'phone' => $row->phone, 'address' => $row->address,
                'status' => $row->status->value, 'status_label' => $row->status->label(),
            ]),
            'teachers' => Teacher::query()->with('user')->orderBy('employee_number')->get()->map(fn (Teacher $row) => [
                'id' => $row->id, 'user_id' => $row->user_id, 'user_name' => $row->user?->name,
                'employee_number' => $row->employee_number, 'name' => $row->name, 'email' => $row->email,
                'phone' => $row->phone, 'address' => $row->address, 'status' => $row->status->value,
                'status_label' => $row->status->label(),
            ]),
            'classes' => SchoolClass::query()->with('homeroomTeacher')->orderBy('grade_level')->orderBy('section')->get()->map(fn (SchoolClass $row) => [
                'id' => $row->id, 'name' => $row->name, 'grade_level' => $row->grade_level, 'section' => $row->section,
                'homeroom_teacher_id' => $row->homeroom_teacher_id, 'homeroom_teacher_name' => $row->homeroomTeacher?->name,
            ]),
            'subjects' => Subject::query()->orderBy('name')->get()->map(fn (Subject $row) => [
                'id' => $row->id, 'code' => $row->code, 'name' => $row->name, 'description' => $row->description,
            ]),
            'academic-years' => AcademicYear::query()->orderByDesc('starts_at')->get()->map(fn (AcademicYear $row) => [
                'id' => $row->id, 'name' => $row->name, 'starts_at' => $row->starts_at->format('Y-m-d'),
                'ends_at' => $row->ends_at->format('Y-m-d'), 'is_active' => $row->is_active,
                'status_label' => $row->is_active ? 'Aktif' : 'Arsip',
            ]),
            default => collect(),
        };

        return $records->values()->all();
    }

    public function catalogOptions(): array
    {
        return [
            'teachers' => Teacher::query()->where('status', 'active')->orderBy('name')->get()
                ->map(fn (Teacher $row) => ['value' => $row->id, 'label' => "{$row->employee_number} · {$row->name}"])->all(),
            // Daftar akun yang menjadi anggota peran teacher pada sekolah aktif.
            'teacher_users' => User::query()->whereHas('memberships', fn ($q) => $q
                ->where('school_id', TenantContext::active()->schoolId())->where('role', SchoolRole::TEACHER->value))
                ->orderBy('name')->get()
                ->map(fn (User $row) => ['value' => $row->id, 'label' => "{$row->name} · {$row->email}"])->all(),
        ];
    }

    public function masterDataSummary(): array
    {
        return [
            ['key' => 'students', 'title' => 'Siswa', 'count' => Student::query()->count(), 'description' => 'Identitas dan status siswa'],
            ['key' => 'teachers', 'title' => 'Guru', 'count' => Teacher::query()->count(), 'description' => 'Profil guru dan akun login'],
            ['key' => 'classes', 'title' => 'Kelas', 'count' => SchoolClass::query()->count(), 'description' => 'Rombongan belajar dan wali kelas'],
            ['key' => 'subjects', 'title' => 'Mata Pelajaran', 'count' => Subject::query()->count(), 'description' => 'Kode dan nama mata pelajaran'],
            ['key' => 'academic-years', 'title' => 'Tahun Ajaran', 'count' => AcademicYear::query()->count(), 'description' => AcademicYear::query()->where('is_active', true)->value('name') ?? 'Belum ada tahun ajaran aktif'],
            ['key' => 'enrollments', 'title' => 'Penempatan Siswa', 'count' => StudentEnrollment::query()->count(), 'description' => 'Penempatan siswa per tahun ajaran'],
            ['key' => 'teacher-assignments', 'title' => 'Penugasan Guru', 'count' => TeacherAssignment::query()->count(), 'description' => 'Penugasan kelas dan mata pelajaran'],
        ];
    }

    public function saveCatalog(string $section, ?int $id, array $data): array
    {
        $model = self::CATALOGS[$section] ?? abort(404);

        return DB::transaction(function () use ($section, $model, $id, $data) {
            if ($section === 'academic-years' && ($data['is_active'] ?? false)) {
                AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
            }
            $record = $id ? $model::query()->findOrFail($id) : new $model;
            $record->fill($data);
            $record->save();

            return ['id' => $record->id];
        });
    }

    public function deleteCatalog(string $section, int $id): bool
    {
        $model = self::CATALOGS[$section] ?? abort(404);
        $record = $model::query()->findOrFail($id);
        $hasDependencies = match ($section) {
            'students' => $record->enrollments()->exists(),
            'teachers' => $record->assignments()->exists() || $record->homeroomClasses()->exists(),
            'classes' => $record->enrollments()->exists() || $record->teacherAssignments()->exists(),
            'subjects' => $record->teacherAssignments()->exists() || Grade::query()->where('subject_id', $id)->exists(),
            'academic-years' => $record->enrollments()->exists() || $record->teacherAssignments()->exists(),
            default => false,
        };
        if ($hasDependencies) return false;
        $record->delete();

        return true;
    }

    public function relationData(string $type, ?int $yearId = null): array
    {
        $years = AcademicYear::query()->orderByDesc('starts_at')->get(['id', 'name'])
            ->map(fn ($row) => ['value' => $row->id, 'label' => $row->name])->all();
        $classes = SchoolClass::query()->orderBy('grade_level')->orderBy('section')->get(['id', 'name'])
            ->map(fn ($row) => ['value' => $row->id, 'label' => $row->name])->all();

        if ($type === 'enrollments') {
            return [
                'students' => Student::query()->where('status', 'active')->orderBy('name')->get(['id', 'student_number', 'name'])
                    ->map(fn ($row) => ['value' => $row->id, 'label' => "{$row->student_number} · {$row->name}"])->all(),
                'classes' => $classes, 'years' => $years,
                'records' => StudentEnrollment::query()->with(['student', 'schoolClass', 'academicYear'])
                    ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->latest('enrolled_at')->get()
                    ->map(fn (StudentEnrollment $row) => [
                        'id' => $row->id, 'student' => "{$row->student->student_number} · {$row->student->name}",
                        'class' => $row->schoolClass->name, 'year' => $row->academicYear->name,
                        'enrolled_at' => $row->enrolled_at->format('Y-m-d'), 'status' => $row->status->label(),
                    ])->all(),
            ];
        }

        return [
            'teachers' => Teacher::query()->where('status', 'active')->orderBy('name')->get(['id', 'employee_number', 'name'])
                ->map(fn ($row) => ['value' => $row->id, 'label' => "{$row->employee_number} · {$row->name}"])->all(),
            'classes' => $classes,
            'subjects' => Subject::query()->orderBy('name')->get(['id', 'code', 'name'])
                ->map(fn ($row) => ['value' => $row->id, 'label' => "{$row->code} · {$row->name}"])->all(),
            'years' => $years,
            'records' => TeacherAssignment::query()->with(['teacher', 'schoolClass', 'subject', 'academicYear'])
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->latest()->get()
                ->map(fn (TeacherAssignment $row) => [
                    'id' => $row->id, 'teacher' => "{$row->teacher->employee_number} · {$row->teacher->name}",
                    'class' => $row->schoolClass->name, 'subject' => "{$row->subject->code} · {$row->subject->name}",
                    'year' => $row->academicYear->name,
                ])->all(),
        ];
    }

    public function storeEnrollment(array $data): void { StudentEnrollment::query()->create($data); }

    public function deleteEnrollment(int $id): bool
    {
        $row = StudentEnrollment::query()->findOrFail($id);
        if ($row->attendances()->exists() || $row->grades()->exists()) return false;
        $row->delete();
        return true;
    }

    public function storeTeacherAssignment(array $data): void { TeacherAssignment::query()->create($data); }

    public function deleteTeacherAssignment(int $id): bool
    {
        $row = TeacherAssignment::query()->findOrFail($id);
        $hasGrades = Grade::query()->where('subject_id', $row->subject_id)->whereHas('enrollment', fn ($q) => $q
            ->where('school_class_id', $row->school_class_id)->where('academic_year_id', $row->academic_year_id))->exists();
        if ($hasGrades) return false;
        $row->delete();
        return true;
    }

    public function availableClasses(User $user, ?int $yearId = null): array
    {
        $query = SchoolClass::query()->when($yearId, fn ($q) => $q->whereHas('enrollments', fn ($e) => $e
            ->where('academic_year_id', $yearId)->where('status', 'active')))->orderBy('grade_level')->orderBy('section');
        if (TenantContext::active()->role() === SchoolRole::TEACHER) {
            $teacherId = Teacher::query()->where('user_id', $user->id)->value('id');
            if (! $teacherId) return [];
            $query->where(function ($q) use ($teacherId, $yearId) {
                $q->where('homeroom_teacher_id', $teacherId)->orWhereHas('teacherAssignments', fn ($a) => $a
                    ->where('teacher_id', $teacherId)->when($yearId, fn ($inner) => $inner->where('academic_year_id', $yearId)));
            });
        }
        return $query->get()->map(fn (SchoolClass $row) => ['value' => $row->id, 'label' => $row->name])->all();
    }

    public function availableSubjects(User $user, int $classId, int $yearId): array
    {
        $query = Subject::query()->orderBy('name');
        if (TenantContext::active()->role() === SchoolRole::TEACHER) {
            $teacherId = Teacher::query()->where('user_id', $user->id)->value('id');
            if (! $teacherId) return [];
            $query->whereHas('teacherAssignments', fn ($a) => $a->where('teacher_id', $teacherId)
                ->where('school_class_id', $classId)->where('academic_year_id', $yearId));
        }
        return $query->get()->map(fn (Subject $row) => ['value' => $row->id, 'label' => "{$row->code} · {$row->name}"])->all();
    }

    public function teacherCanAccess(User $user, int $classId, int $yearId, ?int $subjectId = null): bool
    {
        if (TenantContext::active()->role() !== SchoolRole::TEACHER) return true;
        $teacherId = Teacher::query()->where('user_id', $user->id)->value('id');
        if (! $teacherId) return false;
        if ($subjectId) return TeacherAssignment::query()->where('teacher_id', $teacherId)->where('school_class_id', $classId)
            ->where('academic_year_id', $yearId)->where('subject_id', $subjectId)->exists();
        return TeacherAssignment::query()->where('teacher_id', $teacherId)->where('school_class_id', $classId)->where('academic_year_id', $yearId)->exists()
            || SchoolClass::query()->whereKey($classId)->where('homeroom_teacher_id', $teacherId)->exists();
    }

    public function classAndYearShareTenant(int $classId, int $yearId): bool
    {
        $schoolId = TenantContext::active()->schoolId();

        return $schoolId !== null
            && SchoolClass::query()->whereKey($classId)->where('school_id', $schoolId)->exists()
            && AcademicYear::query()->whereKey($yearId)->where('school_id', $schoolId)->exists();
    }

    public function classYearSubjectShareTenant(int $classId, int $yearId, int $subjectId): bool
    {
        $schoolId = TenantContext::active()->schoolId();

        return $this->classAndYearShareTenant($classId, $yearId)
            && $schoolId !== null
            && Subject::query()->whereKey($subjectId)->where('school_id', $schoolId)->exists();
    }

    public function enrollmentInputsShareTenant(int $studentId, int $classId, int $yearId): bool
    {
        $schoolId = TenantContext::active()->schoolId();

        return $this->classAndYearShareTenant($classId, $yearId)
            && $schoolId !== null
            && Student::query()->whereKey($studentId)->where('school_id', $schoolId)->exists();
    }

    public function assignmentInputsShareTenant(int $teacherId, int $classId, int $subjectId, int $yearId): bool
    {
        $schoolId = TenantContext::active()->schoolId();

        return $this->classYearSubjectShareTenant($classId, $yearId, $subjectId)
            && $schoolId !== null
            && Teacher::query()->whereKey($teacherId)->where('school_id', $schoolId)->exists();
    }

    public function attendanceRoster(int $classId, int $yearId, string $date): array
    {
        return StudentEnrollment::query()->with(['student', 'attendances' => fn ($q) => $q->whereDate('attendance_date', $date)])
            ->where('school_class_id', $classId)->where('academic_year_id', $yearId)->where('status', 'active')->orderBy('id')->get()
            ->map(function (StudentEnrollment $row) {
                $attendance = $row->attendances->first();
                return [
                    'enrollment_id' => $row->id, 'student_number' => $row->student->student_number,
                    'name' => $row->student->name, 'status' => $attendance?->status->value ?? 'present', 'note' => $attendance?->note ?? '',
                ];
            })->all();
    }

    public function saveAttendance(int $classId, int $yearId, string $date, array $students, int $userId): void
    {
        DB::transaction(function () use ($date, $students, $userId) {
            foreach ($students as $row) Attendance::query()->updateOrCreate(
                ['student_enrollment_id' => $row['enrollment_id'], 'attendance_date' => $date],
                ['status' => $row['status'], 'note' => $row['note'] ?? null, 'recorded_by' => $userId],
            );
        });
    }

    public function gradeRoster(int $classId, int $yearId, int $subjectId, string $assessmentName): array
    {
        return StudentEnrollment::query()->with(['student', 'grades' => fn ($q) => $q->where('subject_id', $subjectId)->where('assessment_name', $assessmentName)])
            ->where('school_class_id', $classId)->where('academic_year_id', $yearId)->where('status', 'active')->orderBy('id')->get()
            ->map(function (StudentEnrollment $row) {
                $grade = $row->grades->first();
                return [
                    'enrollment_id' => $row->id, 'student_number' => $row->student->student_number,
                    'name' => $row->student->name, 'score' => $grade?->score, 'max_score' => $grade?->max_score,
                    'note' => $grade?->note ?? '',
                ];
            })->all();
    }

    public function saveGrades(array $data, int $userId): void
    {
        DB::transaction(function () use ($data, $userId) {
            foreach ($data['students'] as $row) {
                $score = $row['score'] ?? null;
                if ($score === null || $score === '') continue;
                Grade::query()->updateOrCreate(
                    ['student_enrollment_id' => $row['enrollment_id'], 'subject_id' => $data['subject_id'], 'assessment_name' => $data['assessment_name']],
                    ['assessment_date' => $data['assessment_date'] ?? null, 'score' => $score, 'max_score' => $data['max_score'],
                        'note' => $row['note'] ?? null, 'recorded_by' => $userId],
                );
            }
        });
    }

    public function dashboardData(?int $yearId = null): array
    {
        $yearId ??= AcademicYear::query()->where('is_active', true)->value('id');
        $enrollments = StudentEnrollment::query()->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId)->where('status', 'active'));
        $attendance = Attendance::query()->whereDate('attendance_date', now()->toDateString())
            ->whereHas('enrollment', fn ($q) => $q->when($yearId, fn ($inner) => $inner->where('academic_year_id', $yearId)));
        return [
            'students' => Student::query()->where('status', 'active')->count(),
            'teachers' => Teacher::query()->where('status', 'active')->count(),
            'classes' => SchoolClass::query()->count(), 'active_enrollments' => $enrollments->count(),
            'today_attendance' => (clone $attendance)->count(),
            'today_present' => (clone $attendance)->where('status', AttendanceStatus::PRESENT->value)->count(),
            'academic_year' => $yearId ? AcademicYear::query()->find($yearId)?->name : null,
        ];
    }

    public function reportData(int $yearId, ?int $classId = null): array
    {
        $rows = StudentEnrollment::query()->with(['student', 'schoolClass'])->where('academic_year_id', $yearId)
            ->where('status', 'active')->when($classId, fn ($q) => $q->where('school_class_id', $classId))
            ->orderBy('school_class_id')->orderBy('id')->get()->map(fn (StudentEnrollment $row) => [
                'student_number' => $row->student->student_number, 'student_name' => $row->student->name,
                'class_name' => $row->schoolClass->name, 'attendance_count' => $row->attendances()->count(),
                'present_count' => $row->attendances()->where('status', 'present')->count(),
                'absent_count' => $row->attendances()->whereIn('status', ['sick', 'excused', 'absent'])->count(),
                'average_score' => $row->grades()->selectRaw('AVG((score / max_score) * 100) as average_score')->value('average_score'),
            ])->all();
        $averages = array_values(array_filter(array_column($rows, 'average_score'), fn ($value) => $value !== null));
        return [
            'students' => count($rows), 'attendance_records' => array_sum(array_column($rows, 'attendance_count')),
            'present_records' => array_sum(array_column($rows, 'present_count')),
            'absent_records' => array_sum(array_column($rows, 'absent_count')),
            'average_score' => count($averages) ? round(array_sum(array_map('floatval', $averages)) / count($averages), 2) : null,
            'rows' => $rows,
        ];
    }
}
