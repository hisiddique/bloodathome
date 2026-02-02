<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ProviderServiceAreaRequest extends FormRequest
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
            'postcode_prefix' => ['required', 'string', 'max:10'],
            'max_distance_miles' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'additional_travel_fee' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'postcode_prefix.required' => 'Please enter a postcode prefix.',
            'postcode_prefix.max' => 'Postcode prefix is too long (maximum 10 characters).',
            'max_distance_miles.numeric' => 'Maximum distance must be a number.',
            'max_distance_miles.min' => 'Maximum distance cannot be negative.',
            'max_distance_miles.max' => 'Maximum distance is too high.',
            'additional_travel_fee.numeric' => 'Travel fee must be a number.',
            'additional_travel_fee.min' => 'Travel fee cannot be negative.',
            'additional_travel_fee.max' => 'Travel fee is too high.',
        ];
    }
}
