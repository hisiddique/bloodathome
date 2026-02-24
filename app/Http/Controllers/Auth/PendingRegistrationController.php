<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PendingRegistrationRequest;
use App\Mail\EmailVerificationOtp;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PendingRegistrationController
 *
 * Handles deferred user registration with OTP email verification before DB insert
 */
class PendingRegistrationController extends Controller
{
    /**
     * Store pending registration data in session and send OTP.
     */
    public function store(PendingRegistrationRequest $request): RedirectResponse
    {
        // Honeypot check - silently reject bot submissions
        if ($request->filled('website')) {
            return redirect()->back();
        }

        $validated = $request->safe()->except(['password_confirmation']);

        // Hash password before storing in session (defense-in-depth)
        $validated['password'] = Hash::make($validated['password']);

        // Store validated data in encrypted session
        $request->session()->put('pending_registration', $validated);

        $email = $validated['email'];
        $fullName = trim($validated['first_name'].' '.$validated['last_name']);

        // Generate 6-digit OTP
        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache with 10-minute expiry
        $otpKey = "email_otp:pending:{$email}";
        Cache::put($otpKey, $otp, now()->addMinutes(10));

        // Initialize verification attempts counter
        $attemptsKey = "email_otp_attempts:pending:{$email}";
        Cache::put($attemptsKey, 0, now()->addMinutes(10));

        // Initialize rate limit counter
        $rateLimitKey = "email_otp_rate_limit:pending:{$email}";
        Cache::put($rateLimitKey, 1, now()->addMinutes(15));

        try {
            // Send OTP via email
            Mail::to($email)->send(new EmailVerificationOtp($otp, $fullName));

            Log::info('Pending registration OTP sent', [
                'email' => $email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send pending registration OTP', [
                'error' => $e->getMessage(),
                'email' => $email,
            ]);

            return redirect()->back()
                ->withErrors(['email' => 'Failed to send verification email. Please try again.']);
        }

        return redirect()->route('verification.pending')->with('status', 'verification-otp-sent');
    }

    /**
     * Show verification page for pending registration.
     */
    public function showVerification(Request $request): Response|RedirectResponse
    {
        // Check if pending registration data exists
        $pendingData = $request->session()->get('pending_registration');

        if (! $pendingData) {
            return redirect()->route('register');
        }

        return Inertia::render('auth/verify-email', [
            'pendingEmail' => $pendingData['email'],
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Verify OTP and create user in database.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ], [
            'otp.required' => 'Verification code is required.',
            'otp.size' => 'Verification code must be 6 digits.',
            'otp.regex' => 'Verification code must contain only numbers.',
        ]);

        // Get pending registration data from session
        $pendingData = $request->session()->get('pending_registration');

        if (! $pendingData) {
            return response()->json([
                'success' => false,
                'message' => 'Registration session expired. Please register again.',
            ], 422);
        }

        $email = $pendingData['email'];
        $otp = $request->input('otp');

        // Check if OTP exists in cache
        $otpKey = "email_otp:pending:{$email}";
        $storedOtp = Cache::get($otpKey);

        if (! $storedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ], 422);
        }

        // Check verification attempts (max 5 attempts per OTP)
        $attemptsKey = "email_otp_attempts:pending:{$email}";
        $attempts = Cache::get($attemptsKey, 0);

        if ($attempts >= 5) {
            // Lock out and clear OTP
            Cache::forget($otpKey);
            Cache::forget($attemptsKey);

            Log::warning('Pending registration locked due to too many failed OTP attempts', [
                'email' => $email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new verification code.',
            ], 429);
        }

        // Use constant-time comparison for security
        if (! hash_equals($storedOtp, $otp)) {
            // Increment failed attempts
            Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(10));

            $remainingAttempts = 5 - ($attempts + 1);

            return response()->json([
                'success' => false,
                'message' => "Invalid verification code. {$remainingAttempts} attempts remaining.",
            ], 422);
        }

        try {
            // Create user in a transaction with a lock to prevent race conditions
            $user = DB::transaction(function () use ($pendingData, $email) {
                // Re-check email uniqueness with lock (race condition guard)
                if (User::where('email', $email)->lockForUpdate()->exists()) {
                    return null;
                }

                // Create user with email already verified
                // Password is already hashed from session storage, use forceFill to bypass cast
                $user = new User;
                $user->forceFill([
                    'first_name' => $pendingData['first_name'],
                    'last_name' => $pendingData['last_name'],
                    'email' => $pendingData['email'],
                    'password' => $pendingData['password'],
                    'email_verified_at' => now(),
                ]);
                $user->save();

                // Create patient profile with date of birth
                Patient::create([
                    'user_id' => $user->id,
                    'date_of_birth' => $pendingData['date_of_birth'],
                ]);

                // Assign patient role by default
                $user->assignRole('patient');

                return $user;
            });

            if (! $user) {
                // Email was already taken (race condition)
                $request->session()->forget('pending_registration');
                Cache::forget($otpKey);
                Cache::forget($attemptsKey);
                Cache::forget("email_otp_rate_limit:pending:{$email}");

                return response()->json([
                    'success' => false,
                    'message' => 'This email is already registered. Please log in instead.',
                ], 422);
            }

            // Authenticate the user
            Auth::login($user);

            // Clear session data and caches
            $request->session()->forget('pending_registration');
            Cache::forget($otpKey);
            Cache::forget($attemptsKey);
            Cache::forget("email_otp_rate_limit:pending:{$email}");

            Log::info('User registered successfully via pending registration', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create user after OTP verification', [
                'error' => $e->getMessage(),
                'email' => $email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Resend OTP for pending registration.
     */
    public function resendOtp(Request $request): JsonResponse
    {
        // Get pending registration data from session
        $pendingData = $request->session()->get('pending_registration');

        if (! $pendingData) {
            return response()->json([
                'success' => false,
                'message' => 'Registration session expired. Please register again.',
            ], 422);
        }

        $email = $pendingData['email'];

        // Check rate limiting (max 3 resends per 15 minutes)
        $rateLimitKey = "email_otp_rate_limit:pending:{$email}";
        $rateLimitAttempts = Cache::get($rateLimitKey, 0);

        if ($rateLimitAttempts >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Too many OTP requests. Please try again in 15 minutes.',
            ], 429);
        }

        // Re-check email uniqueness
        if (User::where('email', $email)->exists()) {
            $request->session()->forget('pending_registration');

            return response()->json([
                'success' => false,
                'message' => 'This email is already registered. Please log in instead.',
            ], 422);
        }

        try {
            // Generate new 6-digit OTP
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

            // Store new OTP in cache
            $otpKey = "email_otp:pending:{$email}";
            Cache::put($otpKey, $otp, now()->addMinutes(10));

            // Reset verification attempts counter
            $attemptsKey = "email_otp_attempts:pending:{$email}";
            Cache::put($attemptsKey, 0, now()->addMinutes(10));

            // Increment rate limit counter
            Cache::put($rateLimitKey, $rateLimitAttempts + 1, now()->addMinutes(15));

            $fullName = trim($pendingData['first_name'].' '.$pendingData['last_name']);

            // Send OTP via email
            Mail::to($email)->send(new EmailVerificationOtp($otp, $fullName));

            Log::info('Pending registration OTP resent', [
                'email' => $email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your email.',
                'data' => [
                    'expires_in_minutes' => 10,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to resend pending registration OTP', [
                'error' => $e->getMessage(),
                'email' => $email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again.',
            ], 500);
        }
    }
}
