<?php

namespace Tests\Feature\Auth;

use App\Mail\EmailVerificationOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_otp_to_authenticated_user(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user)->postJson('/email/send-otp');

        $response->assertSuccessful()
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent to your email.',
            ]);

        Mail::assertSent(EmailVerificationOtp::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        $this->assertTrue(Cache::has("email_otp:{$user->id}"));
        $this->assertTrue(Cache::has("email_otp_attempts:{$user->id}"));
    }

    public function test_prevents_sending_otp_to_already_verified_user(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->postJson('/email/send-otp');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Email is already verified.',
            ]);

        Mail::assertNotSent(EmailVerificationOtp::class);
    }

    public function test_enforces_rate_limiting_for_otp_requests(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send 3 OTP requests (max allowed by Laravel's throttle middleware)
        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($user)->postJson('/email/send-otp')->assertSuccessful();
        }

        // 4th request should be rate limited by Laravel's throttle middleware
        $response = $this->actingAs($user)->postJson('/email/send-otp');

        $response->assertStatus(429);
    }

    public function test_verifies_correct_otp_and_marks_email_as_verified(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send OTP
        $this->actingAs($user)->postJson('/email/send-otp');

        // Get the OTP from cache
        $otp = Cache::get("email_otp:{$user->id}");

        // Verify OTP
        $response = $this->actingAs($user)->postJson('/email/verify-otp', [
            'otp' => $otp,
        ]);

        $response->assertSuccessful()
            ->assertJson([
                'success' => true,
                'message' => 'Email verified successfully!',
            ]);

        $user->refresh();
        $this->assertTrue($user->hasVerifiedEmail());

        // Cache should be cleared
        $this->assertFalse(Cache::has("email_otp:{$user->id}"));
        $this->assertFalse(Cache::has("email_otp_attempts:{$user->id}"));
    }

    public function test_rejects_invalid_otp(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send OTP
        $this->actingAs($user)->postJson('/email/send-otp');

        // Try with wrong OTP
        $response = $this->actingAs($user)->postJson('/email/verify-otp', [
            'otp' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
            ]);

        $user->refresh();
        $this->assertFalse($user->hasVerifiedEmail());

        // Attempts counter should be incremented
        $this->assertEquals(1, Cache::get("email_otp_attempts:{$user->id}"));
    }

    public function test_locks_out_after_5_failed_verification_attempts(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send OTP
        $this->actingAs($user)->postJson('/email/send-otp');

        // Try 5 times with wrong OTP
        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($user)->postJson('/email/verify-otp', ['otp' => '000000']);
        }

        // 6th attempt should be locked out
        $response = $this->actingAs($user)->postJson('/email/verify-otp', ['otp' => '000000']);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new verification code.',
            ]);

        // OTP should be cleared
        $this->assertFalse(Cache::has("email_otp:{$user->id}"));
    }

    public function test_rejects_expired_otp(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send OTP
        $this->actingAs($user)->postJson('/email/send-otp');

        // Clear the OTP to simulate expiry
        Cache::forget("email_otp:{$user->id}");

        // Try to verify
        $response = $this->actingAs($user)->postJson('/email/verify-otp', [
            'otp' => '123456',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ]);
    }

    public function test_validates_otp_format(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user)->postJson('/email/verify-otp', [
            'otp' => '12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('otp');
    }

    public function test_requires_authentication_for_sending_otp(): void
    {
        $response = $this->postJson('/email/send-otp');

        $response->assertUnauthorized();
    }

    public function test_requires_authentication_for_verifying_otp(): void
    {
        $response = $this->postJson('/email/verify-otp', [
            'otp' => '123456',
        ]);

        $response->assertUnauthorized();
    }
}
