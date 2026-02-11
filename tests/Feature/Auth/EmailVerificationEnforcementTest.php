<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationEnforcementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions for tests
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_unverified_users_cannot_access_dashboard(): void
    {
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_unverified_users_cannot_access_bookings(): void
    {
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get('/bookings');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_unverified_users_cannot_access_profile(): void
    {
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get('/profile');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_unverified_users_can_access_verify_email_page(): void
    {
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get(route('verification.notice'));

        $response->assertStatus(200);
    }

    public function test_unverified_users_can_send_otp(): void
    {
        \Illuminate\Support\Facades\Cache::flush();
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->postJson('/email/send-otp');

        $response->assertSuccessful();
        $response->assertJson(['success' => true]);
    }

    public function test_unverified_users_can_logout(): void
    {
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_verified_users_can_access_dashboard(): void
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->markEmailAsVerified();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_verified_users_can_access_protected_routes(): void
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->markEmailAsVerified();
        $user->assignRole('patient');

        $response = $this->actingAs($user)->get('/bookings');

        $response->assertStatus(200);
    }

    public function test_redirect_middleware_allows_verify_email_routes_for_unverified_users(): void
    {
        \Illuminate\Support\Facades\Cache::flush();
        $user = User::factory()->withoutTwoFactor()->unverified()->create();
        $user->assignRole('patient');

        // These routes should be accessible for unverified users
        $this->actingAs($user)->get(route('verification.notice'))->assertStatus(200);
        $this->actingAs($user)->postJson('/email/send-otp')->assertSuccessful();
        $this->actingAs($user)->post('/logout')->assertRedirect('/');
    }
}
