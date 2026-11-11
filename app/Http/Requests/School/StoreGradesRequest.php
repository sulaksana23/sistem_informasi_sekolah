<?php

namespace App\Http\Requests\School;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGradesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $schoolId = TenantContext::active()->schoolId();

        return [
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where('school_id', $schoolId)],
            'subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')->where('school_id', $schoolId)],
            'assessment_name' => ['required', 'string', 'max:120'],
            'assessment_date' => ['nullable', 'date', 'before_or_equal:today'],
            'max_score' => ['required', 'numeric', 'gt:0', 'max:1000'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.enrollment_id' => ['required', 'integer', 'distinct', Rule::exists('student_enrollments', 'id')->where('school_id', $schoolId)],
            'students.*.score' => ['nullable', 'numeric', 'min:0'],
            'students.*.note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
