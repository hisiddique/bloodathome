<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ProviderAvailabilityRequest extends FormRequest
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
            'day_of_week' => ['nullable', 'integer', 'min:0', 'max:6', 'required_without:specific_date'],
            'specific_date' => ['nullable', 'date', 'after_or_equal:today', 'required_without:day_of_week'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_available' => ['boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('is_available')) {
            $this->merge([
                'is_available' => true,
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'day_of_week.integer' => 'Day of week must be a valid number (0-6).',
            'day_of_week.min' => 'Day of week must be between 0 (Sunday) and 6 (Saturday).',
            'day_of_week.max' => 'Day of week must be between 0 (Sunday) and 6 (Saturday).',
            'day_of_week.required_without' => 'Please select either a day of week or a specific date.',
            'specific_date.date' => 'Specific date must be a valid date.',
            'specific_date.after_or_equal' => 'Specific date cannot be in the past.',
            'specific_date.required_without' => 'Please select either a day of week or a specific date.',
            'start_time.required' => 'Please enter a start time.',
            'start_time.date_format' => 'Start time must be in HH:MM format.',
            'end_time.required' => 'Please enter an end time.',
            'end_time.date_format' => 'End time must be in HH:MM format.',
            'end_time.after' => 'End time must be after start time.',
            'is_available.boolean' => 'Availability status must be true or false.',
        ];
    }
}
