<?php

namespace App\Http\Requests\Member;

use App\Enums\SchoolRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route dilindungi can:school.members
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::enum(SchoolRole::class)],
        ];
    }

    public function messages(): array
    {
        return ['email.required' => 'Email wajib diisi.', 'role.required' => 'Peran wajib dipilih.'];
    }
}
