<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

$validData = [
    'first_name' => 'Test',
    'last_name' => 'User',
    'date_of_birth' => '1998-01-15',
    'email' => 'test@example.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'terms_accepted' => '1',
];

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users are not created immediately', function () use ($validData) {
    Mail::fake();

    $response = $this->post(route('register.store'), $validData);

    // User should NOT be in database yet
    expect(User::where('email', $validData['email'])->exists())->toBeFalse();

    // User should NOT be authenticated
    $this->assertGuest();

    // Session should have pending registration data
    $response->assertSessionHas('pending_registration');

    // Should redirect to verification.pending
    $response->assertRedirect(route('verification.pending'));
    $response->assertSessionHas('status', 'verification-otp-sent');

    // OTP should be in cache
    expect(Cache::has("email_otp:pending:{$validData['email']}"))->toBeTrue();
});

test('OTP verification creates user and authenticates', function () use ($validData) {
    Mail::fake();

    // Step 1: Register (creates pending session)
    $this->post(route('register.store'), $validData);

    // Step 2: Get OTP from cache
    $otp = Cache::get("email_otp:pending:{$validData['email']}");
    expect($otp)->not->toBeNull();

    // Step 3: Verify OTP
    $response = $this->postJson('/email/verify-pending-otp', [
        'otp' => $otp,
    ]);

    $response->assertJson([
        'success' => true,
        'message' => 'Email verified successfully!',
    ]);

    // User should now be in database
    $user = User::where('email', $validData['email'])->first();
    expect($user)->not->toBeNull();
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->hasRole('patient'))->toBeTrue();

    // User should be authenticated
    $this->assertAuthenticated();

    // Session and cache should be cleared
    expect(session('pending_registration'))->toBeNull();
    expect(Cache::has("email_otp:pending:{$validData['email']}"))->toBeFalse();
});

test('invalid OTP does not create user', function () use ($validData) {
    Mail::fake();

    // Step 1: Register
    $this->post(route('register.store'), $validData);

    // Step 2: Try to verify with wrong OTP
    $response = $this->postJson('/email/verify-pending-otp', [
        'otp' => '000000',
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'success' => false,
    ]);

    // User should NOT be in database
    expect(User::where('email', $validData['email'])->exists())->toBeFalse();
    $this->assertGuest();
});

test('expired OTP returns error', function () use ($validData) {
    Mail::fake();

    // Step 1: Register
    $this->post(route('register.store'), $validData);

    // Step 2: Clear OTP from cache to simulate expiry
    Cache::forget("email_otp:pending:{$validData['email']}");

    // Step 3: Try to verify
    $response = $this->postJson('/email/verify-pending-otp', [
        'otp' => '123456',
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'success' => false,
        'message' => 'Verification code has expired. Please request a new one.',
    ]);

    expect(User::where('email', $validData['email'])->exists())->toBeFalse();
});

test('too many failed OTP attempts locks out', function () use ($validData) {
    Mail::fake();

    // Step 1: Register
    $this->post(route('register.store'), $validData);

    // Step 2: Set attempts to 5 to simulate lockout
    Cache::put("email_otp_attempts:pending:{$validData['email']}", 5, now()->addMinutes(10));

    // Step 3: Try to verify
    $response = $this->postJson('/email/verify-pending-otp', [
        'otp' => '123456',
    ]);

    $response->assertStatus(429);
    $response->assertJson([
        'success' => false,
        'message' => 'Too many failed attempts. Please request a new verification code.',
    ]);

    // OTP should be cleared
    expect(Cache::has("email_otp:pending:{$validData['email']}"))->toBeFalse();
});

test('resend OTP works', function () use ($validData) {
    Mail::fake();

    // Step 1: Register
    $this->post(route('register.store'), $validData);

    $firstOtp = Cache::get("email_otp:pending:{$validData['email']}");

    // Step 2: Resend OTP
    $response = $this->postJson('/email/resend-pending-otp');

    $response->assertJson([
        'success' => true,
        'message' => 'Verification code sent to your email.',
    ]);

    // New OTP should be in cache
    $newOtp = Cache::get("email_otp:pending:{$validData['email']}");
    expect($newOtp)->not->toBeNull();
    expect($newOtp)->not->toBe($firstOtp);

    // Rate limit should be incremented
    expect(Cache::get("email_otp_rate_limit:pending:{$validData['email']}"))->toBe(2);
});

test('resend rate limiting works', function () use ($validData) {
    Mail::fake();

    // Step 1: Register
    $this->post(route('register.store'), $validData);

    // Step 2: Set rate limit to 3
    Cache::put("email_otp_rate_limit:pending:{$validData['email']}", 3, now()->addMinutes(15));

    // Step 3: Try to resend
    $response = $this->postJson('/email/resend-pending-otp');

    $response->assertStatus(429);
    $response->assertJson([
        'success' => false,
        'message' => 'Too many OTP requests. Please try again in 15 minutes.',
    ]);
});

test('duplicate email prevented at verification time', function () use ($validData) {
    Mail::fake();

    // Step 1: Create a user with the same email
    User::create([
        'first_name' => 'Existing',
        'last_name' => 'User',
        'email' => $validData['email'],
        'password' => 'password',
        'email_verified_at' => now(),
    ]);

    // Step 2: Register with same email (shouldn't get past validation, but let's test race condition)
    // We'll manually set up the pending session to simulate a race condition
    session(['pending_registration' => $validData]);
    $otp = '123456';
    Cache::put("email_otp:pending:{$validData['email']}", $otp, now()->addMinutes(10));
    Cache::put("email_otp_attempts:pending:{$validData['email']}", 0, now()->addMinutes(10));

    // Step 3: Try to verify
    $response = $this->postJson('/email/verify-pending-otp', [
        'otp' => $otp,
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'success' => false,
        'message' => 'This email is already registered. Please log in instead.',
    ]);

    // Session and cache should be cleared
    expect(session('pending_registration'))->toBeNull();
});

test('honeypot rejects bots silently', function () use ($validData) {
    Mail::fake();

    $botData = array_merge($validData, ['website' => 'http://spam.com']);

    $response = $this->post(route('register.store'), $botData);

    // Should redirect back without error
    $response->assertRedirect();

    // No session data should be set
    expect(session('pending_registration'))->toBeNull();

    // No OTP should be sent
    Mail::assertNothingSent();
});

test('registration requires date_of_birth', function () use ($validData) {
    $data = $validData;
    unset($data['date_of_birth']);

    $response = $this->post(route('register.store'), $data);

    $response->assertSessionHasErrors('date_of_birth');
});

test('registration requires user to be 18 or older', function () use ($validData) {
    $data = $validData;
    $data['date_of_birth'] = now()->subYears(17)->format('Y-m-d');

    $response = $this->post(route('register.store'), $data);

    $response->assertSessionHasErrors('date_of_birth');
});

test('registration requires terms acceptance', function () use ($validData) {
    $data = $validData;
    unset($data['terms_accepted']);

    $response = $this->post(route('register.store'), $data);

    $response->assertSessionHasErrors('terms_accepted');
});

test('verify-pending page redirects to register if no session', function () {
    $response = $this->get(route('verification.pending'));

    $response->assertRedirect(route('register'));
});
