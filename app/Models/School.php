<?php

namespace App\Models;

use App\Enums\SchoolLevel;
use App\Enums\SchoolStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'npsn', 'level', 'status', 'accreditation', 'address', 'phone',
    'email', 'website', 'headmaster_name', 'founded_year', 'description',
])]
class School extends Model
{
    public function memberships(): HasMany
    {
        return $this->hasMany(SchoolMembership::class);
    }

    protected function casts(): array
    {
        return [
            'level' => SchoolLevel::class,
            'status' => SchoolStatus::class,
        ];
    }
}
