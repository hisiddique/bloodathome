<?php

namespace App\Actions\Fortify;

use App\Mail\EmailVerificationOtp;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date', 'before_or_equal:'.now()->subYears(18)->format('Y-m-d')],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'terms_accepted' => ['accepted'],
        ], [
            'date_of_birth.before_or_equal' => 'You must be at least 18 years old to register.',
            'terms_accepted.accepted' => 'You must accept the terms and conditions.',
        ])->validate();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'date_of_birth' => $input['date_of_birth'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Assign patient role by default for regular registration
        $user->assignRole('patient');

        // Automatically send OTP for email verification
        $this->sendVerificationOtp($user);

        return $user;
    }

    /**
     * Send verification OTP to the newly registered user.
     */
    protected function sendVerificationOtp(User $user): void
    {
        try {
            // Generate 6-digit OTP
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

            // Store OTP in cache with 10-minute expiry
            $otpKey = "email_otp:{$user->id}";
            Cache::put($otpKey, $otp, now()->addMinutes(10));

            // Initialize verification attempts counter
            $attemptsKey = "email_otp_attempts:{$user->id}";
            Cache::put($attemptsKey, 0, now()->addMinutes(10));

            // Initialize rate limit counter
            $rateLimitKey = "email_otp_rate_limit:{$user->id}";
            Cache::put($rateLimitKey, 1, now()->addMinutes(15));

            // Send OTP via email
            Mail::to($user->email)->send(new EmailVerificationOtp($otp, $user->full_name));

            Log::info('Email verification OTP sent after registration', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email verification OTP after registration', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }
}
