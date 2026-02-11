<?php

use App\Models\User;
use App\Models\UserAddress;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->patient = User::factory()->create();
    $this->patient->assignRole('patient');
});

test('authenticated patients can access address create page', function () {
    $response = $this->actingAs($this->patient)->get('/addresses/create');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('patient/addresses/create'));
});

test('authenticated patients can store new address with lat lng', function () {
    $addressData = [
        'label' => 'Home',
        'address_line1' => '123 Main Street',
        'address_line2' => 'Flat 4B',
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
        'latitude' => 51.5007,
        'longitude' => -0.1246,
        'is_default' => true,
    ];

    $response = $this->actingAs($this->patient)->post('/addresses', $addressData);

    $response->assertRedirect('/addresses');
    $response->assertSessionHas('success', 'Address added successfully.');

    $this->assertDatabaseHas('user_addresses', [
        'user_id' => $this->patient->id,
        'label' => 'Home',
        'address_line1' => '123 Main Street',
        'address_line2' => 'Flat 4B',
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
        'latitude' => 51.5007,
        'longitude' => -0.1246,
        'is_default' => true,
    ]);
});

test('authenticated patients can store address without lat lng', function () {
    $addressData = [
        'label' => 'Work',
        'address_line1' => '456 Office Lane',
        'town_city' => 'Manchester',
        'postcode' => 'M1 1AA',
        'is_default' => false,
    ];

    $response = $this->actingAs($this->patient)->post('/addresses', $addressData);

    $response->assertRedirect('/addresses');

    $this->assertDatabaseHas('user_addresses', [
        'user_id' => $this->patient->id,
        'label' => 'Work',
        'address_line1' => '456 Office Lane',
        'town_city' => 'Manchester',
        'postcode' => 'M1 1AA',
        'latitude' => null,
        'longitude' => null,
        'is_default' => false,
    ]);
});

test('authenticated patients can access address edit page', function () {
    $address = UserAddress::factory()->create([
        'user_id' => $this->patient->id,
    ]);

    $response = $this->actingAs($this->patient)->get("/addresses/{$address->id}/edit");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('patient/addresses/edit')
        ->has('address')
    );
});

test('authenticated patients can update address', function () {
    $address = UserAddress::factory()->create([
        'user_id' => $this->patient->id,
        'label' => 'Old Label',
        'address_line1' => 'Old Address',
        'town_city' => 'Old City',
        'postcode' => 'OLD 123',
    ]);

    $updateData = [
        'label' => 'Updated Home',
        'address_line1' => '789 New Street',
        'town_city' => 'Birmingham',
        'postcode' => 'B1 1AA',
        'latitude' => 52.4862,
        'longitude' => -1.8904,
        'is_default' => true,
    ];

    $response = $this->actingAs($this->patient)->patch("/addresses/{$address->id}", $updateData);

    $response->assertRedirect('/addresses');
    $response->assertSessionHas('success', 'Address updated successfully.');

    $this->assertDatabaseHas('user_addresses', [
        'id' => $address->id,
        'user_id' => $this->patient->id,
        'label' => 'Updated Home',
        'address_line1' => '789 New Street',
        'town_city' => 'Birmingham',
        'postcode' => 'B1 1AA',
        'latitude' => 52.4862,
        'longitude' => -1.8904,
        'is_default' => true,
    ]);
});

test('patients cannot access another users address edit page', function () {
    $otherUser = User::factory()->create();
    $otherUser->assignRole('patient');

    $address = UserAddress::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($this->patient)->get("/addresses/{$address->id}/edit");

    $response->assertForbidden();
});

test('patients cannot update another users address', function () {
    $otherUser = User::factory()->create();
    $otherUser->assignRole('patient');

    $address = UserAddress::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $updateData = [
        'label' => 'Hacked',
        'address_line1' => 'Hacker Street',
        'town_city' => 'Hackville',
        'postcode' => 'HACK1',
    ];

    $response = $this->actingAs($this->patient)->patch("/addresses/{$address->id}", $updateData);

    $response->assertForbidden();

    $this->assertDatabaseMissing('user_addresses', [
        'id' => $address->id,
        'label' => 'Hacked',
    ]);
});

test('non patients cannot access address create page', function () {
    $provider = User::factory()->create();
    $provider->assignRole('provider');

    $response = $this->actingAs($provider)->get('/addresses/create');

    $response->assertForbidden();
});

test('non patients cannot store addresses', function () {
    $provider = User::factory()->create();
    $provider->assignRole('provider');

    $addressData = [
        'label' => 'Test',
        'address_line1' => 'Test Street',
        'town_city' => 'Test City',
        'postcode' => 'TEST1',
    ];

    $response = $this->actingAs($provider)->post('/addresses', $addressData);

    $response->assertForbidden();

    $this->assertDatabaseMissing('user_addresses', [
        'user_id' => $provider->id,
    ]);
});

test('guests cannot access address create page', function () {
    $response = $this->get('/addresses/create');

    $response->assertRedirect('/login');
});

test('validation requires label address_line1 town_city and postcode', function () {
    $response = $this->actingAs($this->patient)->post('/addresses', []);

    $response->assertSessionHasErrors(['label', 'address_line1', 'town_city', 'postcode']);
});

test('validation allows optional address_line2 latitude and longitude', function () {
    $addressData = [
        'label' => 'Minimal',
        'address_line1' => 'Minimal Street',
        'town_city' => 'Minimal City',
        'postcode' => 'MIN1AA',
    ];

    $response = $this->actingAs($this->patient)->post('/addresses', $addressData);

    $response->assertRedirect('/addresses');
    $response->assertSessionHasNoErrors();
});

test('validation rejects invalid latitude values', function () {
    $addressData = [
        'label' => 'Test',
        'address_line1' => 'Test Street',
        'town_city' => 'Test City',
        'postcode' => 'TEST1',
        'latitude' => 91, // Invalid: > 90
    ];

    $response = $this->actingAs($this->patient)->post('/addresses', $addressData);

    $response->assertSessionHasErrors(['latitude']);
});

test('validation rejects invalid longitude values', function () {
    $addressData = [
        'label' => 'Test',
        'address_line1' => 'Test Street',
        'town_city' => 'Test City',
        'postcode' => 'TEST1',
        'longitude' => 181, // Invalid: > 180
    ];

    $response = $this->actingAs($this->patient)->post('/addresses', $addressData);

    $response->assertSessionHasErrors(['longitude']);
});
