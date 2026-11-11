<?php

namespace App\Models;

use App\Enums\SchoolRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['school_id', 'user_id', 'role'])]
class SchoolMembership extends Model
{
    protected function casts(): array
    {
        return ['role' => SchoolRole::class];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
