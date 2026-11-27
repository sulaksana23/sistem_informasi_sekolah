<?php

namespace App\Models;

use App\Enums\StudentGender;
use App\Enums\StudentStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['student_number', 'nisn', 'name', 'gender', 'birth_date', 'phone', 'address', 'status'])]
class Student extends Model
{
    use BelongsToTenant;
    use HasFactory;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'gender' => StudentGender::class,
            'status' => StudentStatus::class,
            'birth_date' => 'date',
        ];
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }
}
