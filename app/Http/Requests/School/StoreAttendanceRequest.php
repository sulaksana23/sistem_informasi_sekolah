<?php

namespace App\Http\Requests\School;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $schoolId = TenantContext::active()->schoolId();

        return [
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where('school_id', $schoolId)],
            'attendance_date' => ['required', 'date', 'before_or_equal:today'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.enrollment_id' => ['required', 'integer', 'distinct', Rule::exists('student_enrollments', 'id')->where('school_id', $schoolId)],
            'students.*.status' => ['required', Rule::in(['present', 'sick', 'excused', 'absent'])],
            'students.*.note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
