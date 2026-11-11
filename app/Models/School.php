<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class School extends Model
{
    public function memberships(): HasMany
    {
        return $this->hasMany(SchoolMembership::class);
    }
}
