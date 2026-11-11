<?php

namespace App\Http\Requests\Tenancy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SwitchSchoolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'school_id' => ['required', 'integer', Rule::exists('schools', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'school_id.required' => 'Pilih sekolah terlebih dahulu.',
            'school_id.exists' => 'Sekolah tersebut tidak ditemukan.',
        ];
    }
}
