<?php

namespace App\Http\Requests\Member;

use App\Enums\SchoolRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route dilindungi can:school.members
    }

    public function rules(): array
    {
        return ['role' => ['required', Rule::enum(SchoolRole::class)]];
    }
}
