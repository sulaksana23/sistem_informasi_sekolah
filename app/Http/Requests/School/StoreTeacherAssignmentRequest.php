<?php

namespace App\Http\Requests\School;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherAssignmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $schoolId = TenantContext::active()->schoolId();

        return [
            'teacher_id' => [
                'required', 'integer', Rule::exists('teachers', 'id')->where('school_id', $schoolId)->where('status', 'active'),
                Rule::unique('teacher_assignments', 'teacher_id')
                    ->where('school_class_id', $this->input('school_class_id'))
                    ->where('subject_id', $this->input('subject_id'))
                    ->where('academic_year_id', $this->input('academic_year_id')),
            ],
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')->where('school_id', $schoolId)],
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where('school_id', $schoolId)],
        ];
    }
}
