<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Services\Tenancy\TenantContext;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function memberships()
    {
        return $this->hasMany(SchoolMembership::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teacherProfile()
    {
        // Satu akun bisa menjadi guru di lebih dari satu sekolah; profil guru
        // diambil untuk sekolah aktif (TenantContext). Tanpa konteks,
        // hasilnya kosong (fail-closed).
        $schoolId = TenantContext::active()->schoolId();

        return $this->hasOne(Teacher::class)->where(function ($q) use ($schoolId) {
            $schoolId === null ? $q->whereRaw('1 = 0') : $q->where('school_id', $schoolId);
        });
    }
}
