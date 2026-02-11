<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

/**
 * CreatePaymentIntentRequest
 *
 * Validation for creating a Stripe payment intent
 */
class CreatePaymentIntentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Handle both draftId (frontend) and booking_id (internal)
        if ($this->has('draftId') && ! $this->has('booking_id')) {
            $this->merge([
                'booking_id' => $this->input('draftId'),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'string', 'exists:bookings,id'],
            'draftId' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking ID is required.',
            'booking_id.exists' => 'Booking not found.',
        ];
    }
}
