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

it('saves an address', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'label' => 'Home',
        'address_line1' => '10 Downing Street',
        'address_line2' => null,
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true])
        ->assertJsonStructure(['data' => ['address' => ['id', 'label', 'address_line1']]]);

    $this->assertDatabaseHas('user_addresses', [
        'user_id' => $this->user->id,
        'label' => 'Home',
        'address_line1' => '10 Downing Street',
    ]);
});

it('rejects unauthenticated address save', function () {
    $response = $this->postJson('/api/addresses', [
        'label' => 'Home',
        'address_line1' => '10 Downing Street',
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
    ]);

    expect($response->status())->toBeIn([401, 302, 419]);
});

it('rejects missing label', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'address_line1' => '10 Downing Street',
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['label']);
});

it('rejects missing address_line1', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'label' => 'Home',
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['address_line1']);
});

it('saves with optional address_line2', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'label' => 'Work',
        'address_line1' => '1 Parliament Square',
        'address_line2' => 'Floor 3',
        'town_city' => 'London',
        'postcode' => 'SW1A 0AA',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('user_addresses', [
        'user_id' => $this->user->id,
        'address_line2' => 'Floor 3',
    ]);
});

it('rejects missing town_city', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'label' => 'Home',
        'address_line1' => '10 Downing Street',
        'postcode' => 'SW1A 1AA',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['town_city']);
});

it('rejects missing postcode', function () {
    $response = $this->actingAs($this->user)->postJson('/api/addresses', [
        'label' => 'Home',
        'address_line1' => '10 Downing Street',
        'town_city' => 'London',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['postcode']);
});
