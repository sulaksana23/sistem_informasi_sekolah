<?php

namespace App\Repositories\School;

use App\Models\User;
use Itmm\EasyRepository\Repository;

interface SchoolRepository extends Repository
{
    public function classSectionExists(int $gradeLevel, string $section, ?int $exceptId = null): bool;
    public function catalogRecords(string $section): array;
    public function catalogOptions(): array;
    public function masterDataSummary(): array;
    public function saveCatalog(string $section, ?int $id, array $data): array;
    public function deleteCatalog(string $section, int $id): bool;
    public function relationData(string $type, ?int $yearId = null): array;
    public function storeEnrollment(array $data): void;
    public function deleteEnrollment(int $id): bool;
    public function storeTeacherAssignment(array $data): void;
    public function deleteTeacherAssignment(int $id): bool;
    public function availableClasses(User $user, ?int $yearId = null): array;
    public function availableSubjects(User $user, int $classId, int $yearId): array;
    public function teacherCanAccess(User $user, int $classId, int $yearId, ?int $subjectId = null): bool;
    public function attendanceRoster(int $classId, int $yearId, string $date): array;
    public function classAndYearShareTenant(int $classId, int $yearId): bool;
    public function classYearSubjectShareTenant(int $classId, int $yearId, int $subjectId): bool;
    public function enrollmentInputsShareTenant(int $studentId, int $classId, int $yearId): bool;
    public function assignmentInputsShareTenant(int $teacherId, int $classId, int $subjectId, int $yearId): bool;
    public function saveAttendance(int $classId, int $yearId, string $date, array $students, int $userId): void;
    public function gradeRoster(int $classId, int $yearId, int $subjectId, string $assessmentName): array;
    public function saveGrades(array $data, int $userId): void;
    public function dashboardData(?int $yearId = null): array;
    public function reportData(int $yearId, ?int $classId = null): array;
}
