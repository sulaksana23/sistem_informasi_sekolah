<?php

use App\Http\Controllers\AuditLog\AuditLogController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\School\SchoolController;
use App\Http\Controllers\Tenancy\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login.store');

    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1')
        ->name('register.store');

    Route::get('/forgot-password', [PasswordResetController::class, 'showForgot'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink'])
        ->middleware('throttle:5,1')
        ->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])
        ->middleware('throttle:5,1')
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    // Konteks tenant butuh auth; logout + halaman "tanpa sekolah" + pembagantian
    // sekolah tetap bisa dilakukan tanpa keanggotaan yang sah.
    Route::get('/no-school', [TenantController::class, 'noSchool'])->name('tenant.no-school');
    Route::post('/tenancy/current', [TenantController::class, 'switchSchool'])
        ->middleware('throttle:10,1')
        ->name('tenant.current.store');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Seluruh area aplikasi membutuhkan konteks sekolah aktif (keanggotaan sah,
    // lihat app/Http/Middleware/SetTenantContext.php).
    Route::middleware('tenant.context')->group(function () {
        Route::get('/', fn () => redirect()->route('dashboard'))->name('home');
        Route::get('/dashboard', [SchoolController::class, 'dashboard'])->name('dashboard');

        // Profil sekolah: semua anggota sekolah boleh melihat, hanya
        // admin/staff (school.manage) yang boleh mengubah.
        Route::get('/school/profile', [SchoolController::class, 'profile'])->name('school.profile.index');

        Route::middleware('can:school.manage')->prefix('school')->name('school.')->group(function () {
            Route::get('/master-data', [SchoolController::class, 'masterData'])->name('master-data.index');
            Route::put('/profile', [SchoolController::class, 'updateProfile'])->name('profile.update');
            foreach (['students', 'teachers', 'classes', 'subjects', 'academic-years'] as $section) {
                Route::get('/'.$section, [SchoolController::class, 'catalog'])->defaults('section', $section)->name($section.'.index');
            }
            Route::post('/catalog/{section}', [SchoolController::class, 'storeCatalog'])->whereIn('section', ['students', 'teachers', 'classes', 'subjects', 'academic-years'])->name('catalog.store');
            Route::put('/catalog/{section}/{id}', [SchoolController::class, 'updateCatalog'])->whereIn('section', ['students', 'teachers', 'classes', 'subjects', 'academic-years'])->whereNumber('id')->name('catalog.update');
            Route::delete('/catalog/{section}/{id}', [SchoolController::class, 'destroyCatalog'])->whereIn('section', ['students', 'teachers', 'classes', 'subjects', 'academic-years'])->whereNumber('id')->name('catalog.destroy');

            Route::get('/enrollments', [SchoolController::class, 'relationPage'])->defaults('type', 'enrollments')->name('enrollments.index');
            Route::post('/enrollments', [SchoolController::class, 'storeEnrollment'])->name('enrollments.store');
            Route::delete('/enrollments/{id}', [SchoolController::class, 'destroyEnrollment'])->whereNumber('id')->name('enrollments.destroy');
            Route::get('/teacher-assignments', [SchoolController::class, 'relationPage'])->defaults('type', 'teacher-assignments')->name('teacher-assignments.index');
            Route::post('/teacher-assignments', [SchoolController::class, 'storeTeacherAssignment'])->name('teacher-assignments.store');
            Route::delete('/teacher-assignments/{id}', [SchoolController::class, 'destroyTeacherAssignment'])->whereNumber('id')->name('teacher-assignments.destroy');
        });

        Route::middleware('can:school.academic')->prefix('school')->name('school.')->group(function () {
            Route::get('/attendance', [SchoolController::class, 'attendance'])->name('attendance.index');
            Route::post('/attendance', [SchoolController::class, 'storeAttendance'])->name('attendance.store');
            Route::get('/grades', [SchoolController::class, 'grades'])->name('grades.index');
            Route::post('/grades', [SchoolController::class, 'storeGrades'])->name('grades.store');
        });

        Route::middleware('can:school.manage')->get('/school/audit-logs', [AuditLogController::class, 'index'])->name('school.audit-logs.index');

        // Kelola anggota sekolah aktif — hanya admin.
        Route::middleware('can:school.members')->prefix('school/members')->name('school.members.')->group(function () {
            Route::get('/', [MemberController::class, 'index'])->name('index');
            Route::post('/', [MemberController::class, 'store'])->middleware('throttle:20,1')->name('store');
            Route::put('/{id}', [MemberController::class, 'update'])->whereNumber('id')->name('update');
            Route::delete('/{id}', [MemberController::class, 'destroy'])->whereNumber('id')->name('destroy');
        });

        Route::middleware('can:school.report')->get('/school/reports', [SchoolController::class, 'reports'])->name('school.reports.index');
    });
});

// File mengembalikan lebih awal saat EXAMPLE_ENABLED=false, jadi muat di luar
// callback group. routes/example.php menerapkan middleware auth pada route-nya.
require __DIR__.'/example.php';
