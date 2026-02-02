<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class PatientPaymentMethodRequest extends FormRequest
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
            'stripe_payment_method_id' => ['required', 'string', 'max:255'],
            'stripe_customer_id' => ['required', 'string', 'max:255'],
            'card_brand' => ['required', 'string', 'max:50'],
            'card_last_four' => ['required', 'string', 'size:4'],
            'card_exp_month' => ['required', 'integer', 'min:1', 'max:12'],
            'card_exp_year' => ['required', 'integer', 'min:'.now()->year],
            'is_default' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'stripe_payment_method_id.required' => 'Payment method ID is required.',
            'stripe_customer_id.required' => 'Customer ID is required.',
            'card_brand.required' => 'Card brand is required.',
            'card_last_four.required' => 'Card last four digits are required.',
            'card_last_four.size' => 'Card last four digits must be exactly 4 digits.',
            'card_exp_month.required' => 'Card expiration month is required.',
            'card_exp_month.min' => 'Invalid expiration month.',
            'card_exp_month.max' => 'Invalid expiration month.',
            'card_exp_year.required' => 'Card expiration year is required.',
            'card_exp_year.min' => 'Card has expired.',
        ];
    }
}
