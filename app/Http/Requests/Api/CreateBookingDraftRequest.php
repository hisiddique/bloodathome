<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

/**
 * CreateBookingDraftRequest
 *
 * Validation for creating a booking draft
 */
class CreateBookingDraftRequest extends FormRequest
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
            'provider_id' => ['required', 'string', 'exists:providers,id'],
            'collection_type_id' => ['required', 'integer', 'exists:collection_types,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'time_slot' => ['required', 'string', 'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/'],
            'service_items' => ['required', 'array', 'min:1'],
            'service_items.*' => ['required', 'string', 'exists:services,id'],
            'nhs_number' => ['nullable', 'string', 'max:20'],
            'service_address_line1' => ['required_if:collection_type_id,1', 'nullable', 'string', 'max:255'],
            'service_address_line2' => ['nullable', 'string', 'max:255'],
            'service_town_city' => ['required_if:collection_type_id,1', 'nullable', 'string', 'max:100'],
            'service_postcode' => ['required_if:collection_type_id,1', 'nullable', 'string', 'max:10'],
            'visit_instructions' => ['nullable', 'string', 'max:1000'],
            'patient_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'provider_id.required' => 'Provider selection is required.',
            'provider_id.exists' => 'Selected provider does not exist.',
            'collection_type_id.required' => 'Collection type is required.',
            'scheduled_date.required' => 'Appointment date is required.',
            'scheduled_date.after_or_equal' => 'Appointment date must be today or in the future.',
            'time_slot.required' => 'Time slot selection is required.',
            'time_slot.regex' => 'Invalid time format. Use HH:MM format.',
            'service_items.required' => 'At least one service must be selected.',
            'service_items.min' => 'At least one service must be selected.',
            'service_address_line1.required_if' => 'Address is required for home visits.',
            'service_town_city.required_if' => 'Town/City is required for home visits.',
            'service_postcode.required_if' => 'Postcode is required for home visits.',
        ];
    }
}
