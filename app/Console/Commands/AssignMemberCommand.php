<?php

namespace App\Console\Commands;

use App\Enums\SchoolRole;
use App\Models\School;
use App\Models\User;
use App\Services\Tenancy\TenantService;
use Illuminate\Console\Command;

class AssignMemberCommand extends Command
{
    protected $signature = 'school:assign-member
        {email : Email akun yang dijadikan anggota}
        {role : admin | staff | teacher}
        {--school-id= : ID sekolah (wajib bila sekolah lebih dari satu)}';

    protected $description = 'Menetapkan keanggotaan akun pada satu sekolah beserta perannya';

    public function handle(): int
    {
        $user = User::query()->where('email', mb_strtolower(trim($this->argument('email'))))->first();
        if (! $user) {
            $this->error('Akun dengan email tersebut tidak ditemukan.');
            return 1;
        }

        $role = SchoolRole::tryFrom((string) $this->argument('role'));
        if (! $role) {
            $this->error('Peran harus berupa admin, staff, atau teacher.');
            return self::FAILURE;
        }

        $school = $this->resolveSchool();
        if (! $school instanceof School) {
            return 1;
        }

        TenantService::assignMember($user->id, $school->id, $role);
        $this->info("{$user->email} menjadi {$role->label()} di {$school->name} (ID {$school->id}).");

        return 0;
    }

    private function resolveSchool(): ?School
    {
        $schoolId = $this->option('school-id');
        if ($schoolId !== null) {
            $school = School::query()->find((int) $schoolId);
            if (! $school) {
                $this->error("Sekolah dengan ID {$schoolId} tidak ditemukan.");
                return null;
            }

            return $school;
        }

        $schools = School::query()->orderBy('id')->get();
        if ($schools->isEmpty()) {
            $this->error('Belum ada sekolah. Buat dulu: php artisan school:create-school {nama}');
            return null;
        }
        if ($schools->count() > 1) {
            $this->error('Ada lebih dari satu sekolah; wajib menyertakan --school-id=');
            $schools->each(fn (School $row) => $this->line("  {$row->id}  {$row->name}"));

            return null;
        }

        return $schools->first();
    }
}
