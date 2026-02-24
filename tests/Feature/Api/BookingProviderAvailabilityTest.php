<?php

use App\Models\Provider;
use Database\Seeders\CollectionTypeSeeder;
use Database\Seeders\ProviderStatusSeeder;
use Database\Seeders\ProviderTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\ServiceActiveStatusSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed([
        RoleAndPermissionSeeder::class,
        CollectionTypeSeeder::class,
        ProviderTypeSeeder::class,
        ProviderStatusSeeder::class,
        ServiceCategorySeeder::class,
        ServiceActiveStatusSeeder::class,
    ]);

    $this->provider = Provider::factory()->active()->create();
});

it('returns slots for a provider', function () {
    $date = now()->addDay()->format('Y-m-d');

    $response = $this->getJson("/api/providers/{$this->provider->id}/availability?date={$date}");

    $response->assertSuccessful()
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => ['date', 'slots'],
        ]);

    expect($response->json('data.date'))->toBe($date);
});

it('rejects past date', function () {
    $response = $this->getJson("/api/providers/{$this->provider->id}/availability?date=".now()->subDay()->format('Y-m-d'));

    $response->assertUnprocessable();
});

it('rejects missing date', function () {
    $response = $this->getJson("/api/providers/{$this->provider->id}/availability");

    $response->assertUnprocessable();
});

it('returns 404 for nonexistent provider', function () {
    $response = $this->getJson('/api/providers/nonexistent-id/availability?date='.now()->addDay()->format('Y-m-d'));

    $response->assertNotFound();
});
