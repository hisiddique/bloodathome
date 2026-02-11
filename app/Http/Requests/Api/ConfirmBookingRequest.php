<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ConfirmBookingRequest
 *
 * Validation for confirming a booking after payment
 */
class ConfirmBookingRequest extends FormRequest
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
        if ($this->has('draft_id') && ! $this->has('booking_id')) {
            $this->merge([
                'booking_id' => $this->input('draft_id'),
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
            'draft_id' => ['nullable', 'string'],
            'payment_intent_id' => ['required', 'string', 'starts_with:pi_'],
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
            'payment_intent_id.required' => 'Payment intent ID is required.',
            'payment_intent_id.starts_with' => 'Invalid payment intent ID format.',
        ];
    }
}
