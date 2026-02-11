<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

/**
 * SearchProvidersRequest
 *
 * Validation for provider search endpoint
 */
class SearchProvidersRequest extends FormRequest
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
        if ($this->has('collection_type')) {
            $collectionTypeInput = $this->input('collection_type');

            // Map frontend format to database format
            $collectionTypeMap = [
                'home_visit' => 'Home Visit',
                'clinic' => 'Clinic',
                'Home Visit' => 'Home Visit',
                'Clinic' => 'Clinic',
            ];

            $normalizedType = $collectionTypeMap[$collectionTypeInput] ?? $collectionTypeInput;

            $this->merge([
                'collection_type' => $normalizedType,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:1', 'max:50'],
            'service_id' => ['nullable', 'string'],
            'service_ids' => ['nullable', 'array'],
            'service_ids.*' => ['string'],
            'collection_type' => ['nullable', 'string', 'in:Home Visit,Clinic'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'latitude.required' => 'Location latitude is required.',
            'latitude.between' => 'Invalid latitude value.',
            'longitude.required' => 'Location longitude is required.',
            'longitude.between' => 'Invalid longitude value.',
            'radius_km.min' => 'Search radius must be at least 1 km.',
            'radius_km.max' => 'Search radius cannot exceed 50 km.',
            'service_id.exists' => 'Selected service does not exist.',
            'service_ids.*.exists' => 'One or more selected services do not exist.',
            'collection_type.in' => 'Invalid collection type.',
        ];
    }
}
