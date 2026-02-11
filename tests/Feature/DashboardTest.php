<?php

namespace Tests\Feature;

use App\Models\Provider;
use App\Models\User;
use Database\Seeders\ProviderStatusSeeder;
use Database\Seeders\ProviderTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_dashboard_renders_patient_dashboard_for_patients()
    {
        $user = User::factory()->create();
        $user->assignRole('patient');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('patient/dashboard'));
    }

    public function test_dashboard_renders_provider_dashboard_for_providers()
    {
        $this->seed([ProviderTypeSeeder::class, ProviderStatusSeeder::class]);

        $user = User::factory()->create();
        $user->assignRole('provider');
        Provider::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('provider/dashboard'));
    }
}
