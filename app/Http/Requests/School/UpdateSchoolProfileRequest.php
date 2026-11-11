<?php

namespace App\Http\Requests\School;

use App\Enums\SchoolLevel;
use App\Enums\SchoolStatus;
use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSchoolProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi `can:school.manage`; cek di sini menjaga
        // request ini tetap aman bila nanti dipakai di route lain.
        return $this->user() !== null && TenantContext::active()->schoolId() !== null;
    }

    public function rules(): array
    {
        $schoolId = TenantContext::active()->schoolId();

        return [
            'name' => ['required', 'string', 'max:150', Rule::unique('schools', 'name')->ignore($schoolId)],
            // NPSN unik secara nasional, jadi diperiksa lintas sekolah.
            'npsn' => ['nullable', 'string', 'max:20', 'regex:/^[0-9]+$/', Rule::unique('schools', 'npsn')->ignore($schoolId)],
            'level' => ['nullable', Rule::enum(SchoolLevel::class)],
            'status' => ['nullable', Rule::enum(SchoolStatus::class)],
            'accreditation' => ['nullable', Rule::in(['A', 'B', 'C', 'Belum terakreditasi'])],
            'address' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'website' => ['nullable', 'url', 'max:150'],
            'headmaster_name' => ['nullable', 'string', 'max:150'],
            'founded_year' => ['nullable', 'integer', 'min:1800', 'max:'.now()->year],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama sekolah wajib diisi.',
            'name.unique' => 'Nama sekolah sudah dipakai sekolah lain.',
            'npsn.regex' => 'NPSN hanya boleh berisi angka.',
            'npsn.unique' => 'NPSN sudah terdaftar pada sekolah lain.',
            'website.url' => 'Alamat situs harus berupa URL valid (mis. https://sekolah.sch.id).',
            'founded_year.max' => 'Tahun berdiri tidak boleh melewati tahun ini.',
        ];
    }
}
