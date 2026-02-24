<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class]);
    $this->user = User::factory()->asPatient()->create();
});

it('stores a dependent', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'child',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'dependent' => ['id', 'first_name', 'last_name', 'full_name', 'date_of_birth', 'relationship'],
        ]);

    $this->assertDatabaseHas('dependents', [
        'user_id' => $this->user->id,
        'first_name' => 'Emma',
    ]);
});

it('rejects unauthenticated dependent creation', function () {
    $response = $this->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'child',
    ]);

    expect($response->status())->toBeIn([401, 302, 419]);
});

it('rejects missing first_name', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'child',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['first_name']);
});

it('rejects invalid relationship', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'friend',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['relationship']);
});

it('rejects future date_of_birth', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => now()->addYear()->format('Y-m-d'),
        'relationship' => 'child',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['date_of_birth']);
});

it('stores with optional nhs_number', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'child',
        'nhs_number' => '1234567890',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true]);
    expect($response->json('dependent.nhs_number'))->toBe('1234567890');
});

it('rejects missing last_name', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'date_of_birth' => '2015-06-15',
        'relationship' => 'child',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['last_name']);
});

it('rejects missing date_of_birth', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'relationship' => 'child',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['date_of_birth']);
});

it('rejects missing relationship', function () {
    $response = $this->actingAs($this->user)->postJson('/api/dependents', [
        'first_name' => 'Emma',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-06-15',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['relationship']);
});
