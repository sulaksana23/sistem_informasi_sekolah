<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Mengubah semua tabel data sekolah menjadi milik satu tenant (kolom
 * school_id). Data lama berasal dari asumsi satu instalasi = satu sekolah
 * (lihat PRD), sehingga pemetaannya tidak ambigu: seluruh baris lama
 * dihubungkan ke tenant pertama (tenant awal dibuat di sini bila belum ada).
 */
return new class extends Migration
{
    private const TABLES = [
        'academic_years', 'teachers', 'students', 'school_classes', 'subjects',
        'student_enrollments', 'teacher_assignments', 'attendances', 'grades',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->unsignedBigInteger('school_id')->nullable();
            });
        }

        // Tenant awal untuk seluruh data lama. Nama bisa diganti lewat env
        // TENANT_INITIAL_NAME (config/tenancy.php).
        $initialId = DB::table('schools')->orderBy('id')->value('id')
            ?? DB::table('schools')->insertGetId([
                'name' => config('tenancy.initial_school_name', 'Sekolah Utama'),
                'created_at' => now(), 'updated_at' => now(),
            ]);

        // Backfill tunggal konsisten: skema lama berasumsi satu instalasi =
        // satu sekolah, jadi SEMUA baris data lama (termasuk attendances dan
        // grades yang parent-nya student_enrollments) dihubungkan ke tenant
        // awal yang sama. FK lama menjamin student_enrollment_id valid, jadi
        // tidak ada pemetaan yang ditebak di sini.
        foreach (self::TABLES as $table) {
            DB::table($table)->whereNull('school_id')->update(['school_id' => $initialId]);
        }

        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->unsignedBigInteger('school_id')->nullable(false)->change();
            });
            Schema::table($table, function (Blueprint $table) {
                $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            });
        }

        Schema::table('academic_years', function (Blueprint $table) {
            $table->dropUnique('academic_years_name_unique');
            $table->unique(['school_id', 'name']);
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->index('user_id');
            $table->dropUnique('teachers_user_id_unique');
            $table->dropUnique('teachers_employee_number_unique');
            $table->unique(['school_id', 'user_id']);
            $table->unique(['school_id', 'employee_number']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('students_student_number_unique');
            $table->dropUnique('students_nisn_unique');
            $table->unique(['school_id', 'student_number']);
            $table->unique(['school_id', 'nisn']);
        });

        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropUnique('school_classes_grade_level_section_unique');
            $table->unique(['school_id', 'grade_level', 'section']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropUnique('subjects_code_unique');
            $table->unique(['school_id', 'code']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['school_id', 'attendance_date']);
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->index(['school_id', 'assessment_name']);
        });

        // Peran global di users digantikan peran per sekolah di
        // school_memberships (oleh sistem multi-sekolah).
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 24)->default('teacher')->after('password')->index();
        });

        // FK school_id dilepas lebih dulu; index school_id* di bawah dipakai
        // sebagai penopang FK sehingga tidak bisa dihapus selagi FK ada.
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropForeign(['school_id']);
            });
        }

        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex(['school_id', 'assessment_name']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['school_id', 'attendance_date']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropUnique(['school_id', 'code']);
            $table->unique('code');
        });

        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropUnique(['school_id', 'grade_level', 'section']);
            $table->unique(['grade_level', 'section']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['school_id', 'student_number']);
            $table->dropUnique(['school_id', 'nisn']);
            $table->unique('student_number');
            $table->unique('nisn');
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->unique('user_id');
            $table->dropIndex(['user_id']);
            $table->dropUnique(['school_id', 'user_id']);
            $table->dropUnique(['school_id', 'employee_number']);
            $table->unique('employee_number');
        });

        Schema::table('academic_years', function (Blueprint $table) {
            $table->dropUnique(['school_id', 'name']);
            $table->unique('name');
        });

        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('school_id');
            });
        }
    }
};
