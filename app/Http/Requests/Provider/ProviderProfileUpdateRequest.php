<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ProviderProfileUpdateRequest extends FormRequest
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
            'provider_name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:100'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'town_city' => ['nullable', 'string', 'max:100'],
            'postcode' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'provider_name.required' => 'Please enter your provider name.',
            'provider_name.max' => 'Provider name is too long (maximum 255 characters).',
            'bio.max' => 'Bio is too long (maximum 2000 characters).',
            'experience_years.integer' => 'Experience years must be a number.',
            'experience_years.min' => 'Experience years cannot be negative.',
            'experience_years.max' => 'Experience years is too high.',
            'address_line1.max' => 'Address line 1 is too long (maximum 255 characters).',
            'address_line2.max' => 'Address line 2 is too long (maximum 255 characters).',
            'town_city.max' => 'Town/City is too long (maximum 100 characters).',
            'postcode.max' => 'Postcode is too long (maximum 20 characters).',
        ];
    }
}
