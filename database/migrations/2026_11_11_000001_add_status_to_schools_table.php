<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Melengkapi profil sekolah: kolom `status` (negeri/swasta) yang dipakai
     * App\Enums\SchoolStatus, dan melebarkan `accreditation` karena pilihan
     * "Belum terakreditasi" (18 karakter) tidak muat di varchar(2).
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('status', 20)->nullable()->after('level');
            $table->string('accreditation', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('accreditation', 2)->nullable()->change();
            $table->dropColumn('status');
        });
    }
};
