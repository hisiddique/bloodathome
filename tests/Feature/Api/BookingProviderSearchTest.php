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

    $this->provider = Provider::factory()->active()->create([
        'latitude' => 51.5074,
        'longitude' => -0.1278,
    ]);
});

it('returns providers from search', function () {
    $response = $this->postJson('/api/providers/search', [
        'latitude' => 51.5074,
        'longitude' => -0.1278,
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => ['providers', 'search_params'],
        ]);
});

it('rejects missing latitude', function () {
    $response = $this->postJson('/api/providers/search', [
        'longitude' => -0.1278,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['latitude']);
});

it('rejects out-of-range latitude', function () {
    $response = $this->postJson('/api/providers/search', [
        'latitude' => 91.0,
        'longitude' => -0.1278,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['latitude']);
});

it('rejects missing longitude', function () {
    $response = $this->postJson('/api/providers/search', [
        'latitude' => 51.5074,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['longitude']);
});

it('rejects out-of-range longitude', function () {
    $response = $this->postJson('/api/providers/search', [
        'latitude' => 51.5074,
        'longitude' => 181,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['longitude']);
});
