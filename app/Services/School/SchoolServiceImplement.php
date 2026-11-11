<?php

namespace App\Services\School;

use App\Models\User;
use App\Repositories\School\SchoolRepository;
use Illuminate\Validation\ValidationException;
use Itmm\EasyRepository\Service;

class SchoolServiceImplement extends Service
{
    private const CATALOGS = [
        'students' => ['title' => 'Data Siswa', 'description' => 'Kelola identitas dan status siswa.', 'columns' => [
            ['key' => 'student_number', 'label' => 'NIS'], ['key' => 'nisn', 'label' => 'NISN'], ['key' => 'name', 'label' => 'Nama'],
            ['key' => 'gender_label', 'label' => 'Jenis kelamin'], ['key' => 'status_label', 'label' => 'Status'],
        ]],
        'teachers' => ['title' => 'Data Guru', 'description' => 'Kelola profil guru dan hubungkan akun login.', 'columns' => [
            ['key' => 'employee_number', 'label' => 'NIP / ID Pegawai'], ['key' => 'name', 'label' => 'Nama'],
            ['key' => 'email', 'label' => 'Email'], ['key' => 'user_name', 'label' => 'Akun'], ['key' => 'status_label', 'label' => 'Status'],
        ]],
        'classes' => ['title' => 'Data Kelas', 'description' => 'Kelola rombongan belajar dan wali kelas.', 'columns' => [
            ['key' => 'name', 'label' => 'Nama kelas'], ['key' => 'grade_level', 'label' => 'Tingkat'],
            ['key' => 'section', 'label' => 'Rombel'], ['key' => 'homeroom_teacher_name', 'label' => 'Wali kelas'],
        ]],
        'subjects' => ['title' => 'Mata Pelajaran', 'description' => 'Kelola kode dan nama mata pelajaran.', 'columns' => [
            ['key' => 'code', 'label' => 'Kode'], ['key' => 'name', 'label' => 'Mata pelajaran'], ['key' => 'description', 'label' => 'Keterangan'],
        ]],
        'academic-years' => ['title' => 'Tahun Ajaran', 'description' => 'Atur periode dan satu tahun ajaran aktif.', 'columns' => [
            ['key' => 'name', 'label' => 'Tahun ajaran'], ['key' => 'starts_at', 'label' => 'Mulai'], ['key' => 'ends_at', 'label' => 'Selesai'],
            ['key' => 'status_label', 'label' => 'Status'],
        ]],
    ];

    public function __construct(protected SchoolRepository $mainRepository) {}

    public function dashboard(): array
    {
        return $this->mainRepository->dashboardData();
    }

    public function masterDataOverview(): array
    {
        return $this->mainRepository->masterDataSummary();
    }

    public function profile(): array
    {
        return $this->mainRepository->schoolProfile();
    }

    public function updateProfile(array $data): void
    {
        // Kolom opsional yang dikosongkan dikirim sebagai string kosong oleh
        // form; simpan sebagai null supaya konsisten dengan kolom nullable.
        $data = array_map(
            fn ($value) => $value === '' ? null : $value,
            $data,
        );
        $this->mainRepository->updateSchoolProfile($data);
    }

    public function catalog(string $section): array
    {
        abort_unless(isset(self::CATALOGS[$section]), 404);
        $config = self::CATALOGS[$section];
        $fields = match ($section) {
            'students' => [
                $this->field('student_number', 'NIS', 'text', true), $this->field('nisn', 'NISN', 'text'),
                $this->field('name', 'Nama lengkap', 'text', true),
                $this->field('gender', 'Jenis kelamin', 'select', true, [['value' => 'male', 'label' => 'Laki-laki'], ['value' => 'female', 'label' => 'Perempuan']]),
                $this->field('birth_date', 'Tanggal lahir', 'date'), $this->field('phone', 'Nomor telepon', 'text'),
                $this->field('address', 'Alamat', 'textarea'),
                $this->field('status', 'Status', 'select', true, $this->options(['active' => 'Aktif', 'graduated' => 'Lulus', 'transferred' => 'Pindah', 'inactive' => 'Tidak aktif'])),
            ],
            'teachers' => [
                $this->field('employee_number', 'NIP / ID Pegawai', 'text', true), $this->field('name', 'Nama lengkap', 'text', true),
                $this->field('user_id', 'Akun login guru (opsional)', 'select', false, $this->mainRepository->catalogOptions()['teacher_users']),
                $this->field('email', 'Email', 'email'), $this->field('phone', 'Nomor telepon', 'text'), $this->field('address', 'Alamat', 'textarea'),
                $this->field('status', 'Status', 'select', true, $this->options(['active' => 'Aktif', 'inactive' => 'Tidak aktif'])),
            ],
            'classes' => [
                $this->field('name', 'Nama kelas', 'text', true), $this->field('grade_level', 'Tingkat (1–12)', 'number', true),
                $this->field('section', 'Rombel', 'text', true),
                $this->field('homeroom_teacher_id', 'Wali kelas (opsional)', 'select', false, $this->mainRepository->catalogOptions()['teachers']),
            ],
            'subjects' => [
                $this->field('code', 'Kode mata pelajaran', 'text', true), $this->field('name', 'Nama mata pelajaran', 'text', true),
                $this->field('description', 'Keterangan', 'textarea'),
            ],
            'academic-years' => [
                $this->field('name', 'Nama tahun ajaran', 'text', true), $this->field('starts_at', 'Tanggal mulai', 'date', true),
                $this->field('ends_at', 'Tanggal selesai', 'date', true), $this->field('is_active', 'Jadikan tahun ajaran aktif', 'checkbox'),
            ],
        };

        return [...$config, 'section' => $section, 'fields' => $fields,
            'records' => $this->mainRepository->catalogRecords($section)];
    }

    public function saveCatalog(string $section, ?int $id, array $data): array
    {
        abort_unless(isset(self::CATALOGS[$section]), 404);
        if ($section === 'classes') {
            $exists = $this->mainRepository->classSectionExists((int) $data['grade_level'], $data['section'], $id);
            if ($exists) {
                throw ValidationException::withMessages(['section' => 'Tingkat dan rombel tersebut sudah terdaftar.']);
            }
        }

        return $this->mainRepository->saveCatalog($section, $id, $data);
    }

    public function deleteCatalog(string $section, int $id): void
    {
        abort_unless(isset(self::CATALOGS[$section]), 404);
        if (! $this->mainRepository->deleteCatalog($section, $id)) {
            throw ValidationException::withMessages(['record' => 'Data tidak dapat dihapus karena masih digunakan oleh data akademik.']);
        }
    }

    public function relationPage(string $type, ?int $yearId = null): array
    {
        abort_unless(in_array($type, ['enrollments', 'teacher-assignments'], true), 404);
        $data = $this->mainRepository->relationData($type, $yearId);
        if ($type === 'enrollments') {
            return [
                'title' => 'Penempatan Siswa', 'description' => 'Tempatkan siswa pada kelas dan tahun ajaran.', 'type' => $type,
                'fields' => [
                    $this->field('student_id', 'Siswa', 'select', true, $data['students']),
                    $this->field('school_class_id', 'Kelas', 'select', true, $data['classes']),
                    $this->field('academic_year_id', 'Tahun ajaran', 'select', true, $data['years']),
                    $this->field('enrolled_at', 'Tanggal masuk', 'date', true),
                    $this->field('status', 'Status', 'select', true, $this->options(['active' => 'Aktif', 'completed' => 'Selesai', 'transferred' => 'Pindah'])),
                ],
                'columns' => [['key' => 'student', 'label' => 'Siswa'], ['key' => 'class', 'label' => 'Kelas'],
                    ['key' => 'year', 'label' => 'Tahun ajaran'], ['key' => 'enrolled_at', 'label' => 'Tanggal masuk'], ['key' => 'status', 'label' => 'Status']],
                'records' => $data['records'], 'year_options' => $data['years'], 'selected_year' => $yearId,
            ];
        }

        return [
            'title' => 'Penugasan Guru', 'description' => 'Hubungkan guru, kelas, mata pelajaran, dan tahun ajaran.', 'type' => $type,
            'fields' => [
                $this->field('teacher_id', 'Guru', 'select', true, $data['teachers']),
                $this->field('school_class_id', 'Kelas', 'select', true, $data['classes']),
                $this->field('subject_id', 'Mata pelajaran', 'select', true, $data['subjects']),
                $this->field('academic_year_id', 'Tahun ajaran', 'select', true, $data['years']),
            ],
            'columns' => [['key' => 'teacher', 'label' => 'Guru'], ['key' => 'class', 'label' => 'Kelas'],
                ['key' => 'subject', 'label' => 'Mata pelajaran'], ['key' => 'year', 'label' => 'Tahun ajaran']],
            'records' => $data['records'], 'year_options' => $data['years'], 'selected_year' => $yearId,
        ];
    }

    public function saveEnrollment(array $data): void
    {
        if (! $this->mainRepository->enrollmentInputsShareTenant((int) $data['student_id'], (int) $data['school_class_id'], (int) $data['academic_year_id'])) {
            throw ValidationException::withMessages(['academic_year_id' => 'Siswa, kelas, dan tahun ajaran bukan milik sekolah yang sama.']);
        }
        $this->mainRepository->storeEnrollment($data);
    }

    public function deleteEnrollment(int $id): void
    {
        if (! $this->mainRepository->deleteEnrollment($id)) {
            throw ValidationException::withMessages(['record' => 'Penempatan tidak dapat dihapus karena sudah memiliki absensi atau nilai.']);
        }
    }

    public function saveTeacherAssignment(array $data): void
    {
        if (! $this->mainRepository->assignmentInputsShareTenant(
            (int) $data['teacher_id'], (int) $data['school_class_id'], (int) $data['subject_id'], (int) $data['academic_year_id'], )) {
            throw ValidationException::withMessages(['academic_year_id' => 'Guru, kelas, mata pelajaran, dan tahun ajaran bukan milik sekolah yang sama.']);
        }
        $this->mainRepository->storeTeacherAssignment($data);
    }

    public function deleteTeacherAssignment(int $id): void
    {
        if (! $this->mainRepository->deleteTeacherAssignment($id)) {
            throw ValidationException::withMessages(['record' => 'Penugasan tidak dapat dihapus karena sudah memiliki nilai.']);
        }
    }

    public function attendancePage(User $user, array $filters): array
    {
        $years = $this->yearOptions();
        $yearId = (int) ($filters['academic_year_id'] ?? $this->activeYearId($years));
        $classes = $this->mainRepository->availableClasses($user, $yearId ?: null);
        $classId = (int) ($filters['school_class_id'] ?? ($classes[0]['value'] ?? 0));
        if ($classId && ! collect($classes)->contains(fn ($row) => (int) $row['value'] === $classId)) {
            abort(403);
        }
        $date = $filters['attendance_date'] ?? now()->toDateString();
        $roster = $classId && $yearId ? $this->mainRepository->attendanceRoster($classId, $yearId, $date) : [];

        return [
            'years' => $years, 'classes' => $classes, 'selected_year' => $yearId ?: null,
            'selected_class' => $classId ?: null, 'selected_date' => $date,
            'students' => $roster, 'statuses' => $this->options(['present' => 'Hadir', 'sick' => 'Sakit', 'excused' => 'Izin', 'absent' => 'Alpa']),
        ];
    }

    public function saveAttendance(User $user, array $data): void
    {
        $classId = (int) $data['school_class_id'];
        $yearId = (int) $data['academic_year_id'];
        abort_unless($this->mainRepository->teacherCanAccess($user, $classId, $yearId), 403);
        $expected = collect($this->mainRepository->attendanceRoster($classId, $yearId, $data['attendance_date']))->pluck('enrollment_id')->map(fn ($id) => (int) $id)->sort()->values();
        $provided = collect($data['students'])->pluck('enrollment_id')->map(fn ($id) => (int) $id)->sort()->values();
        if ($expected->all() !== $provided->all()) {
            throw ValidationException::withMessages(['students' => 'Daftar siswa berubah. Muat ulang halaman sebelum menyimpan absensi.']);
        }
        if (! $this->mainRepository->classAndYearShareTenant($classId, $yearId)) {
            throw ValidationException::withMessages(['school_class_id' => 'Kelas dan tahun ajaran bukan milik sekolah aktif.']);
        }
        $this->mainRepository->saveAttendance($classId, $yearId, $data['attendance_date'], $data['students'], $user->id);
    }

    public function gradePage(User $user, array $filters): array
    {
        $years = $this->yearOptions();
        $yearId = (int) ($filters['academic_year_id'] ?? $this->activeYearId($years));
        $classes = $this->mainRepository->availableClasses($user, $yearId ?: null);
        $classId = (int) ($filters['school_class_id'] ?? ($classes[0]['value'] ?? 0));
        if ($classId && ! collect($classes)->contains(fn ($row) => (int) $row['value'] === $classId)) {
            abort(403);
        }
        $subjects = $classId && $yearId ? $this->mainRepository->availableSubjects($user, $classId, $yearId) : [];
        $subjectId = (int) ($filters['subject_id'] ?? ($subjects[0]['value'] ?? 0));
        if ($subjectId && ! collect($subjects)->contains(fn ($row) => (int) $row['value'] === $subjectId)) {
            abort(403);
        }
        $assessment = trim((string) ($filters['assessment_name'] ?? 'Penilaian 1')) ?: 'Penilaian 1';
        $roster = $classId && $yearId && $subjectId ? $this->mainRepository->gradeRoster($classId, $yearId, $subjectId, $assessment) : [];
        $maxScore = $filters['max_score'] ?? ($roster[0]['max_score'] ?? 100);

        return [
            'years' => $years, 'classes' => $classes, 'subjects' => $subjects,
            'selected_year' => $yearId ?: null, 'selected_class' => $classId ?: null, 'selected_subject' => $subjectId ?: null,
            'assessment_name' => $assessment, 'assessment_date' => $filters['assessment_date'] ?? now()->toDateString(),
            'max_score' => $maxScore, 'students' => $roster,
        ];
    }

    public function saveGrades(User $user, array $data): void
    {
        $classId = (int) $data['school_class_id'];
        $yearId = (int) $data['academic_year_id'];
        $subjectId = (int) $data['subject_id'];
        abort_unless($this->mainRepository->teacherCanAccess($user, $classId, $yearId, $subjectId), 403);
        foreach ($data['students'] as $row) {
            if (isset($row['score']) && $row['score'] !== '' && (float) $row['score'] > (float) $data['max_score']) {
                throw ValidationException::withMessages(['students' => 'Nilai siswa tidak boleh melebihi nilai maksimum.']);
            }
        }
        $expected = collect($this->mainRepository->gradeRoster($classId, $yearId, $subjectId, $data['assessment_name']))->pluck('enrollment_id')->map(fn ($id) => (int) $id)->sort()->values();
        $provided = collect($data['students'])->pluck('enrollment_id')->map(fn ($id) => (int) $id)->sort()->values();
        if ($expected->all() !== $provided->all()) {
            throw ValidationException::withMessages(['students' => 'Daftar siswa berubah. Muat ulang halaman sebelum menyimpan nilai.']);
        }
        if (! $this->mainRepository->classYearSubjectShareTenant($classId, $yearId, $subjectId)) {
            throw ValidationException::withMessages(['subject_id' => 'Kelas, tahun ajaran, dan mata pelajaran bukan milik sekolah yang sama.']);
        }
        $this->mainRepository->saveGrades($data, $user->id);
    }

    public function reportPage(array $filters): array
    {
        $years = $this->yearOptions();
        $yearId = (int) ($filters['academic_year_id'] ?? $this->activeYearId($years));
        $classId = isset($filters['school_class_id']) && $filters['school_class_id'] !== '' ? (int) $filters['school_class_id'] : null;
        $classes = collect($this->mainRepository->catalogRecords('classes'))->map(fn ($row) => [
            'value' => $row['id'], 'label' => $row['name'],
        ])->all();
        $selectedClassExists = ! $classId || collect($classes)->contains(fn ($row) => (int) $row['value'] === $classId);
        abort_unless($selectedClassExists, 404);

        return [
            'years' => $years, 'classes' => $classes, 'selected_year' => $yearId ?: null, 'selected_class' => $classId,
            'summary' => $yearId ? $this->mainRepository->reportData($yearId, $classId) : [
                'students' => 0, 'attendance_records' => 0, 'present_records' => 0, 'absent_records' => 0, 'average_score' => null, 'rows' => [],
            ],
        ];
    }

    private function yearOptions(): array
    {
        return collect($this->mainRepository->catalogRecords('academic-years'))->map(fn ($row) => [
            'value' => $row['id'], 'label' => $row['name'], 'active' => $row['is_active'],
        ])->all();
    }

    private function activeYearId(array $years): ?int
    {
        foreach ($years as $year) {
            if ($year['active']) {
                return (int) $year['value'];
            }
        }

        return isset($years[0]) ? (int) $years[0]['value'] : null;
    }

    private function options(array $map): array
    {
        return collect($map)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values()->all();
    }

    private function field(string $name, string $label, string $type, bool $required = false, array $options = []): array
    {
        return ['name' => $name, 'label' => $label, 'type' => $type, 'required' => $required, 'options' => $options];
    }
}
