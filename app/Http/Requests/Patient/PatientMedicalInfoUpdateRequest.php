<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class PatientMedicalInfoUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nhs_number' => ['nullable', 'string', 'max:20'],
            'known_blood_type' => ['nullable', 'string', 'max:10'],
            'known_allergies' => ['nullable', 'string', 'max:1000'],
            'current_medications' => ['nullable', 'string', 'max:1000'],
            'medical_conditions' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'known_allergies.max' => 'Allergies description is too long (maximum 1000 characters).',
            'current_medications.max' => 'Medications description is too long (maximum 1000 characters).',
            'medical_conditions.max' => 'Medical conditions description is too long (maximum 1000 characters).',
        ];
    }
}
