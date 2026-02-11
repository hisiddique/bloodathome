<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class PatientDependentRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'relationship' => ['required', 'in:child,spouse,parent,other'],
            'nhs_number' => ['nullable', 'string', 'max:10'],
            'allergies' => ['nullable', 'string'],
            'medical_conditions' => ['nullable', 'string'],
            'medications' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'Please enter the dependent\'s first name.',
            'last_name.required' => 'Please enter the dependent\'s last name.',
            'date_of_birth.required' => 'Please enter the date of birth.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'relationship.required' => 'Please select a relationship.',
            'relationship.in' => 'Please select a valid relationship type.',
            'nhs_number.max' => 'NHS number must not exceed 10 characters.',
        ];
    }
}
