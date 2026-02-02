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
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'string', 'exists:bookings,id'],
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
