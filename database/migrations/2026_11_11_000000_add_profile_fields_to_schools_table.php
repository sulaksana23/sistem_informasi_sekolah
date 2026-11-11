<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Profil sekolah: identitas resmi (NPSN, jenjang, akreditasi), kontak, dan
     * keterangan. Semua kolom nullable karena sekolah lama dibuat hanya dengan
     * nama lewat `school:create-school`, lalu profilnya dilengkapi dari UI.
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('npsn', 20)->nullable()->unique()->after('name');
            $table->string('level', 20)->nullable()->after('npsn');
            $table->string('accreditation', 2)->nullable()->after('level');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('headmaster_name')->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->text('description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropUnique(['npsn']);
            $table->dropColumn([
                'npsn', 'level', 'accreditation', 'address', 'phone', 'email',
                'website', 'headmaster_name', 'founded_year', 'description',
            ]);
        });
    }
};
