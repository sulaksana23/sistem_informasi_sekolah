<?php

namespace App\Http\Requests\School;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        $schoolId = TenantContext::active()->schoolId();

        return match ($this->route('section')) {
            'students' => [
                'student_number' => ['required', 'string', 'max:40', Rule::unique('students')->ignore($id)->where('school_id', $schoolId)],
                'nisn' => ['nullable', 'string', 'max:20', Rule::unique('students')->ignore($id)->where('school_id', $schoolId)],
                'name' => ['required', 'string', 'max:255'],
                'gender' => ['required', Rule::in(['male', 'female'])],
                'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
                'phone' => ['nullable', 'string', 'max:30'], 'address' => ['nullable', 'string', 'max:2000'],
                'status' => ['required', Rule::in(['active', 'graduated', 'transferred', 'inactive'])],
            ],
            'teachers' => [
                'user_id' => ['nullable', 'integer', 'exists:users,id', Rule::unique('teachers', 'user_id')->ignore($id)->where('school_id', $schoolId)],
                'employee_number' => ['required', 'string', 'max:40', Rule::unique('teachers', 'employee_number')->ignore($id)->where('school_id', $schoolId)],
                'name' => ['required', 'string', 'max:255'], 'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:30'], 'address' => ['nullable', 'string', 'max:2000'],
                'status' => ['required', Rule::in(['active', 'inactive'])],
            ],
            'classes' => [
                'name' => ['required', 'string', 'max:80'], 'grade_level' => ['required', 'integer', 'between:1,12'],
                'section' => ['required', 'string', 'max:20'], 'homeroom_teacher_id' => ['nullable', 'integer', Rule::exists('teachers', 'id')->where('school_id', $schoolId)],
            ],
            'subjects' => [
                'code' => ['required', 'string', 'max:30', Rule::unique('subjects')->ignore($id)->where('school_id', $schoolId)],
                'name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:2000'],
            ],
            'academic-years' => [
                'name' => ['required', 'string', 'max:20', Rule::unique('academic_years')->ignore($id)->where('school_id', $schoolId)],
                'starts_at' => ['required', 'date'], 'ends_at' => ['required', 'date', 'after:starts_at'],
                'is_active' => ['required', 'boolean'],
            ],
            default => [],
        };
    }
}
