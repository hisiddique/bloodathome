<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PostalCode implements ValidationRule
{
    /**
     * Create a new rule instance.
     */
    public function __construct(private string $region = 'uk') {}

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $patterns = [
            'uk' => '/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i',
            'in' => '/^\d{6}$/',
        ];

        $pattern = $patterns[$this->region] ?? $patterns['uk'];

        if (! preg_match($pattern, $value)) {
            $label = $this->region === 'uk' ? 'postcode' : 'PIN code';
            $fail(__('Please enter a valid :type', ['type' => $label]));
        }
    }
}
