<?php

namespace App\Http\Requests\School;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $schoolId = TenantContext::active()->schoolId();

        return [
            'student_id' => [
                'required', 'integer', Rule::exists('students', 'id')->where('school_id', $schoolId)->where('status', 'active'),
                Rule::unique('student_enrollments', 'student_id')->where('academic_year_id', $this->input('academic_year_id')),
            ],
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where('school_id', $schoolId)],
            'enrolled_at' => ['required', 'date'], 'status' => ['required', Rule::in(['active', 'completed', 'transferred'])],
        ];
    }
}
