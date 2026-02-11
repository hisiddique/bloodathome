<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * EmailVerificationOtpController
 *
 * Handles OTP-based email verification for authenticated users
 */
class EmailVerificationOtpController extends Controller
{
    /**
     * Send OTP to user's email for verification.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified.',
            ], 422);
        }

        // Check rate limiting (max 3 requests per 15 minutes per user)
        $rateLimitKey = "email_otp_rate_limit:{$user->id}";
        $attempts = Cache::get($rateLimitKey, 0);

        if ($attempts >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Too many OTP requests. Please try again in 15 minutes.',
            ], 429);
        }

        try {
            // Generate 6-digit OTP
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

            // Store OTP in cache with 10-minute expiry
            $otpKey = "email_otp:{$user->id}";
            Cache::put($otpKey, $otp, now()->addMinutes(10));

            // Reset verification attempts counter
            $attemptsKey = "email_otp_attempts:{$user->id}";
            Cache::put($attemptsKey, 0, now()->addMinutes(10));

            // Increment rate limit counter (expires after 15 minutes)
            Cache::put($rateLimitKey, $attempts + 1, now()->addMinutes(15));

            // Send OTP via email
            Mail::to($user->email)->send(new EmailVerificationOtp($otp, $user->full_name));

            Log::info('Email verification OTP sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your email.',
                'data' => [
                    'expires_in_minutes' => 10,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email verification OTP', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify OTP and mark email as verified.
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

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified.',
            ], 422);
        }

        $otp = $request->input('otp');
        $otpKey = "email_otp:{$user->id}";
        $storedOtp = Cache::get($otpKey);

        if (! $storedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ], 422);
        }

        // Check verification attempts (max 5 attempts per OTP)
        $attemptsKey = "email_otp_attempts:{$user->id}";
        $attempts = Cache::get($attemptsKey, 0);

        if ($attempts >= 5) {
            // Lock out user and clear OTP
            Cache::forget($otpKey);
            Cache::forget($attemptsKey);

            Log::warning('Email verification locked due to too many failed attempts', [
                'user_id' => $user->id,
                'email' => $user->email,
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
            // Mark email as verified
            $user->markEmailAsVerified();

            // Clear OTP and attempts from cache
            Cache::forget($otpKey);
            Cache::forget($attemptsKey);
            Cache::forget("email_otp_rate_limit:{$user->id}");

            Log::info('Email verified successfully via OTP', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to verify email via OTP', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Verification failed. Please try again.',
            ], 500);
        }
    }
}
