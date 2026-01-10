<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PhoneNumber implements ValidationRule
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
            'uk' => '/^(\+44|0)7\d{9}$/',
            'in' => '/^(\+91|0)?[6-9]\d{9}$/',
        ];

        $pattern = $patterns[$this->region] ?? $patterns['uk'];

        if (! preg_match($pattern, $value)) {
            $fail(__('Please enter a valid phone number'));
        }
    }
}
