<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProviderServiceRequest extends FormRequest
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
        $rules = [
            'base_cost' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'agreed_commission_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
        ];

        if ($this->isMethod('POST')) {
            $rules['service_id'] = ['required', Rule::exists('services', 'id')];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Please select a service.',
            'service_id.exists' => 'The selected service is invalid.',
            'base_cost.required' => 'Please enter a base cost.',
            'base_cost.numeric' => 'Base cost must be a number.',
            'base_cost.min' => 'Base cost cannot be negative.',
            'base_cost.max' => 'Base cost is too high.',
            'agreed_commission_percent.required' => 'Please enter a commission percentage.',
            'agreed_commission_percent.numeric' => 'Commission percentage must be a number.',
            'agreed_commission_percent.min' => 'Commission percentage cannot be negative.',
            'agreed_commission_percent.max' => 'Commission percentage cannot exceed 100%.',
            'start_date.required' => 'Please select a start date.',
            'start_date.date' => 'Start date must be a valid date.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after' => 'End date must be after start date.',
        ];
    }
}
