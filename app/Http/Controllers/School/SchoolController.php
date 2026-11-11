<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\School\CatalogRequest;
use App\Http\Requests\School\StoreAttendanceRequest;
use App\Http\Requests\School\StoreEnrollmentRequest;
use App\Http\Requests\School\StoreGradesRequest;
use App\Http\Requests\School\StoreTeacherAssignmentRequest;
use App\Http\Requests\School\UpdateSchoolProfileRequest;
use App\Services\School\SchoolService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('school/pages/SchoolDashboard', ['stats' => SchoolService::dashboard()]);
    }

    public function masterData()
    {
        return Inertia::render('school/pages/SchoolMasterData', [
            'sections' => SchoolService::masterDataOverview(),
        ]);
    }

    public function profile()
    {
        return Inertia::render('school/pages/SchoolProfile', [
            'profile' => SchoolService::profile(),
        ]);
    }

    public function updateProfile(UpdateSchoolProfileRequest $request)
    {
        SchoolService::updateProfile($request->validated());

        return to_route('school.profile.index')->with('success', 'Profil sekolah berhasil diperbarui.');
    }

    public function catalog(string $section)
    {
        return Inertia::render('school/pages/SchoolCatalog', SchoolService::catalog($section));
    }

    public function storeCatalog(CatalogRequest $request, string $section)
    {
        SchoolService::saveCatalog($section, null, $request->validated());

        return to_route($this->catalogRoute($section))->with('success', 'Data berhasil ditambahkan.');
    }

    public function updateCatalog(CatalogRequest $request, string $section, int $id)
    {
        SchoolService::saveCatalog($section, $id, $request->validated());

        return to_route($this->catalogRoute($section))->with('success', 'Data berhasil diperbarui.');
    }

    public function destroyCatalog(string $section, int $id)
    {
        SchoolService::deleteCatalog($section, $id);

        return to_route($this->catalogRoute($section))->with('success', 'Data berhasil dihapus.');
    }

    public function relationPage(Request $request, string $type)
    {
        $filters = $request->validate(['academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id']]);

        return Inertia::render('school/pages/SchoolRelation', SchoolService::relationPage($type, isset($filters['academic_year_id']) ? (int) $filters['academic_year_id'] : null));
    }

    public function storeEnrollment(StoreEnrollmentRequest $request)
    {
        SchoolService::saveEnrollment($request->validated());

        return to_route('school.enrollments.index')->with('success', 'Penempatan siswa berhasil disimpan.');
    }

    public function destroyEnrollment(int $id)
    {
        SchoolService::deleteEnrollment($id);

        return to_route('school.enrollments.index')->with('success', 'Penempatan siswa berhasil dihapus.');
    }

    public function storeTeacherAssignment(StoreTeacherAssignmentRequest $request)
    {
        SchoolService::saveTeacherAssignment($request->validated());

        return to_route('school.teacher-assignments.index')->with('success', 'Penugasan guru berhasil disimpan.');
    }

    public function destroyTeacherAssignment(int $id)
    {
        SchoolService::deleteTeacherAssignment($id);

        return to_route('school.teacher-assignments.index')->with('success', 'Penugasan guru berhasil dihapus.');
    }

    public function attendance(Request $request)
    {
        $filters = $request->validate([
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id'],
            'school_class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'attendance_date' => ['nullable', 'date', 'before_or_equal:today'],
        ]);

        return Inertia::render('school/pages/SchoolAttendance', SchoolService::attendancePage($request->user(), $filters));
    }

    public function storeAttendance(StoreAttendanceRequest $request)
    {
        SchoolService::saveAttendance($request->user(), $request->validated());

        return to_route('school.attendance.index', $request->only('school_class_id', 'academic_year_id', 'attendance_date'))
            ->with('success', 'Absensi berhasil disimpan.');
    }

    public function grades(Request $request)
    {
        $filters = $request->validate([
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id'],
            'school_class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'assessment_name' => ['nullable', 'string', 'max:120'],
            'assessment_date' => ['nullable', 'date', 'before_or_equal:today'],
            'max_score' => ['nullable', 'numeric', 'gt:0', 'max:1000'],
        ]);

        return Inertia::render('school/pages/SchoolGrades', SchoolService::gradePage($request->user(), $filters));
    }

    public function storeGrades(StoreGradesRequest $request)
    {
        SchoolService::saveGrades($request->user(), $request->validated());

        return to_route('school.grades.index', $request->only('school_class_id', 'academic_year_id', 'subject_id', 'assessment_name', 'assessment_date', 'max_score'))
            ->with('success', 'Nilai berhasil disimpan.');
    }

    public function reports(Request $request)
    {
        $filters = $request->validate([
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id'],
            'school_class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
        ]);

        return Inertia::render('school/pages/SchoolReports', SchoolService::reportPage($filters));
    }

    private function catalogRoute(string $section): string
    {
        return match ($section) {
            'students' => 'school.students.index', 'teachers' => 'school.teachers.index',
            'classes' => 'school.classes.index', 'subjects' => 'school.subjects.index',
            'academic-years' => 'school.academic-years.index', default => abort(404),
        };
    }
}
