<?php

namespace Tests\Feature\Auth;

use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions for tests
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'first_name' => 'Test',
            'last_name' => 'User',
            'date_of_birth' => now()->subYears(25)->format('Y-m-d'),
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => '1',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('verification.notice'));
        $response->assertSessionHas('status', 'verification-otp-sent');
    }

    public function test_registration_requires_date_of_birth()
    {
        $response = $this->post(route('register.store'), [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => '1',
        ]);

        $response->assertSessionHasErrors('date_of_birth');
    }

    public function test_registration_requires_user_to_be_18_or_older()
    {
        $response = $this->post(route('register.store'), [
            'first_name' => 'Test',
            'last_name' => 'User',
            'date_of_birth' => now()->subYears(17)->format('Y-m-d'),
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => '1',
        ]);

        $response->assertSessionHasErrors('date_of_birth');
    }

    public function test_registration_requires_terms_acceptance()
    {
        $response = $this->post(route('register.store'), [
            'first_name' => 'Test',
            'last_name' => 'User',
            'date_of_birth' => now()->subYears(25)->format('Y-m-d'),
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('terms_accepted');
    }
}
