<?php

namespace App\Console\Commands;

use App\Enums\SchoolRole;
use App\Models\User;
use App\Services\Tenancy\TenantService;
use Illuminate\Console\Command;

class CreateSchoolCommand extends Command
{
    protected $signature = 'school:create-school
        {name : Nama sekolah baru (harus unik)}
        {--member-email= : Email akun yang langsung dijadikan anggota admin sekolah ini}';

    protected $description = 'Membuat tenant sekolah baru dan (opsional) menetapkan anggota admin pertama';

    public function handle(): int
    {
        $school = TenantService::createSchool($this->argument('name'));
        $this->info("Sekolah {$school->name} dibuat (ID {$school->id}).");

        $email = $this->option('member-email');
        if ($email) {
            $user = User::query()->where('email', mb_strtolower(trim((string) $email)))->first();
            if (! $user) {
                $this->error("Akun dengan email {$email} tidak ditemukan; sekolah sudah dibuat tanpa anggota.");
                return 1;
            }
            TenantService::assignMember($user->id, $school->id, SchoolRole::ADMIN);
            $this->info("{$user->email} dijadikan admin {$school->name}.");
        } else {
            $this->line('Tambahkan anggota setelahnya: php artisan school:assign-member {email} {school_id} {role}');
        }

        return 0;
    }
}
