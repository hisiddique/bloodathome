<?php

namespace App\Http\Requests\Api;

use App\Models\CollectionType;
use Illuminate\Foundation\Http\FormRequest;

/**
 * CreateBookingDraftRequest
 *
 * Validation for creating a booking draft
 * Accepts frontend payload and transforms to backend structure
 */
class CreateBookingDraftRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow both authenticated and guest users
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];

        // Transform collection_type string to collection_type_id
        // Frontend sends: "home_visit" or "clinic"
        // Database has: "Home Visit" or "Clinic"
        if ($this->has('collection_type')) {
            $collectionTypeInput = $this->input('collection_type');

            // Map frontend format to database format
            $collectionTypeMap = [
                'home_visit' => 'Home Visit',
                'clinic' => 'Clinic',
                'Home Visit' => 'Home Visit',
                'Clinic' => 'Clinic',
            ];

            $collectionTypeName = $collectionTypeMap[$collectionTypeInput] ?? $collectionTypeInput;
            $collectionType = CollectionType::where('name', $collectionTypeName)->first();

            if ($collectionType) {
                $data['collection_type_id'] = $collectionType->id;
                $data['normalized_collection_type'] = $collectionType->name;
            } else {
                // Store invalid type for better error message
                $data['collection_type_id'] = null;
                $data['invalid_collection_type'] = $collectionTypeInput;
            }
        }

        // Rename service_ids to service_items for internal processing
        if ($this->has('service_ids')) {
            $data['service_items'] = $this->input('service_ids');
        }

        // Transform time_of_day to time_slot (HH:MM format)
        // Or accept time_slot directly if provided
        if ($this->has('time_of_day') && ! $this->has('time_slot')) {
            $timeOfDay = $this->input('time_of_day');
            $timeSlotMap = [
                'morning' => '09:00',
                'afternoon' => '13:00',
                'evening' => '17:00',
            ];
            $data['time_slot'] = $timeSlotMap[$timeOfDay] ?? '09:00';
        }

        // Handle nested location object or direct fields
        if ($this->has('location')) {
            $location = $this->input('location');
            if (is_array($location)) {
                $data['service_postcode'] = $location['postcode'] ?? null;
                $data['service_address_line1'] = $location['address'] ?? null;
                $data['service_town_city'] = $location['city'] ?? null;
                $data['service_address_line2'] = $location['address_line2'] ?? null;
            }
        }

        // Use selected_date as scheduled_date
        if ($this->has('selected_date')) {
            $data['scheduled_date'] = $this->input('selected_date');
        }

        // Handle patient_details nested object
        if ($this->has('patient_details')) {
            $patientDetails = $this->input('patient_details');
            if (is_array($patientDetails)) {
                $data['nhs_number'] = $patientDetails['nhs_number'] ?? null;
                $data['patient_notes'] = $patientDetails['notes'] ?? null;
                $data['visit_instructions'] = $patientDetails['visit_instructions'] ?? null;
            }
        }

        // Handle is_nhs_test flag
        if ($this->has('is_nhs_test')) {
            $data['is_nhs_test'] = $this->boolean('is_nhs_test');
        }

        $this->merge($data);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $isGuest = ! auth()->check();

        return [
            'provider_id' => ['required', 'string', 'exists:providers,id'],
            'collection_type' => ['required', 'string', 'in:home_visit,clinic,Home Visit,Clinic'],
            'collection_type_id' => ['required', 'integer', 'exists:collection_types,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'selected_date' => ['nullable', 'date'],
            'time_of_day' => ['nullable', 'string', 'in:morning,afternoon,evening'],
            'time_slot' => ['required', 'string', 'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['required', 'string', 'exists:services,id'],
            'service_items' => ['required', 'array', 'min:1'],
            'service_items.*' => ['required', 'string', 'exists:services,id'],
            'is_nhs_test' => ['nullable', 'boolean'],
            'nhs_number' => ['nullable', 'string', 'max:20'],
            'location' => ['nullable', 'array'],
            'location.postcode' => ['required_if:collection_type,home_visit,Home Visit', 'nullable', 'string', 'max:10'],
            'location.address' => ['required_if:collection_type,home_visit,Home Visit', 'nullable', 'string', 'max:255'],
            'location.city' => ['nullable', 'string', 'max:100'],
            'location.address_line2' => ['nullable', 'string', 'max:255'],
            'service_address_line1' => ['required_if:normalized_collection_type,Home Visit', 'nullable', 'string', 'max:255'],
            'service_address_line2' => ['nullable', 'string', 'max:255'],
            'service_town_city' => ['nullable', 'string', 'max:100'],
            'service_postcode' => ['required_if:normalized_collection_type,Home Visit', 'nullable', 'string', 'max:10'],
            'visit_instructions' => ['nullable', 'string', 'max:1000'],
            'patient_notes' => ['nullable', 'string', 'max:1000'],
            'patient_details' => ['nullable', 'array'],

            // Guest-specific fields
            'guest_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:255'],
            'guest_email' => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'guest_phone' => [$isGuest ? 'required' : 'nullable', 'string', 'max:50'],
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
            'collection_type.required' => 'Collection type is required.',
            'collection_type.in' => 'Invalid collection type. Must be "home_visit" or "clinic".',
            'collection_type_id.required' => 'Collection type is required.',
            'collection_type_id.exists' => 'The selected collection type is not available. Please choose "home_visit" or "clinic".',
            'scheduled_date.required' => 'Appointment date is required.',
            'scheduled_date.after_or_equal' => 'Appointment date must be today or in the future.',
            'time_of_day.in' => 'Invalid time of day. Must be morning, afternoon, or evening.',
            'time_slot.required' => 'Time slot selection is required.',
            'time_slot.regex' => 'Invalid time format. Use HH:MM format.',
            'service_ids.required' => 'At least one service must be selected.',
            'service_ids.min' => 'At least one service must be selected.',
            'service_items.required' => 'At least one service must be selected.',
            'service_items.min' => 'At least one service must be selected.',
            'location.postcode.required_if' => 'Postcode is required for home visits.',
            'location.address.required_if' => 'Address is required for home visits.',
            'service_address_line1.required_if' => 'Address is required for home visits.',
            'service_postcode.required_if' => 'Postcode is required for home visits.',
            'guest_name.required' => 'Full name is required for guest bookings.',
            'guest_email.required' => 'Email address is required for guest bookings.',
            'guest_email.email' => 'Please enter a valid email address.',
            'guest_phone.required' => 'Phone number is required for guest bookings.',
        ];
    }
}
