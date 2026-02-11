<?php

use App\Models\Dependent;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->patient = User::factory()->asPatient()->create();
});

test('index page accessible by patients', function () {
    $this->actingAs($this->patient)
        ->get('/dependents')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('patient/dependents/index')
            ->has('dependents')
        );
});

test('create page accessible by patients', function () {
    $this->actingAs($this->patient)
        ->get('/dependents/create')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('patient/dependents/create')
        );
});

test('store creates dependent', function () {
    $dependentData = [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'date_of_birth' => '2015-05-10',
        'relationship' => 'child',
        'nhs_number' => '1234567890',
        'allergies' => 'Peanuts',
        'medical_conditions' => 'Asthma',
        'medications' => 'Inhaler',
    ];

    $this->actingAs($this->patient)
        ->post('/dependents', $dependentData)
        ->assertRedirect('/dependents');

    $this->assertDatabaseHas('dependents', [
        'user_id' => $this->patient->id,
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'relationship' => 'child',
    ]);
});

test('edit page accessible for own dependents', function () {
    $dependent = Dependent::factory()->create(['user_id' => $this->patient->id]);

    $this->actingAs($this->patient)
        ->get("/dependents/{$dependent->id}/edit")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('patient/dependents/edit')
            ->has('dependent')
        );
});

test('update works for own dependents', function () {
    $dependent = Dependent::factory()->create(['user_id' => $this->patient->id]);

    $updateData = [
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'date_of_birth' => '2015-05-10',
        'relationship' => 'child',
    ];

    $this->actingAs($this->patient)
        ->put("/dependents/{$dependent->id}", $updateData)
        ->assertRedirect('/dependents');

    $this->assertDatabaseHas('dependents', [
        'id' => $dependent->id,
        'first_name' => 'Updated',
        'last_name' => 'Name',
    ]);
});

test('destroy works for own dependents', function () {
    $dependent = Dependent::factory()->create(['user_id' => $this->patient->id]);

    $this->actingAs($this->patient)
        ->delete("/dependents/{$dependent->id}")
        ->assertRedirect('/dependents');

    $this->assertDatabaseMissing('dependents', [
        'id' => $dependent->id,
    ]);
});

test('cannot edit another users dependent', function () {
    $otherUser = User::factory()->asPatient()->create();
    $dependent = Dependent::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->patient)
        ->get("/dependents/{$dependent->id}/edit")
        ->assertForbidden();
});

test('cannot update another users dependent', function () {
    $otherUser = User::factory()->asPatient()->create();
    $dependent = Dependent::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->patient)
        ->put("/dependents/{$dependent->id}", [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'date_of_birth' => '2015-05-10',
            'relationship' => 'child',
        ])
        ->assertForbidden();
});

test('cannot destroy another users dependent', function () {
    $otherUser = User::factory()->asPatient()->create();
    $dependent = Dependent::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->patient)
        ->delete("/dependents/{$dependent->id}")
        ->assertForbidden();
});

test('non-patients cannot access routes', function () {
    $provider = User::factory()->asProvider()->create();

    $this->actingAs($provider)
        ->get('/dependents')
        ->assertForbidden();
});

test('validation requires first name', function () {
    $this->actingAs($this->patient)
        ->post('/dependents', [
            'last_name' => 'Smith',
            'date_of_birth' => '2015-05-10',
            'relationship' => 'child',
        ])
        ->assertSessionHasErrors('first_name');
});

test('validation requires valid relationship', function () {
    $this->actingAs($this->patient)
        ->post('/dependents', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'date_of_birth' => '2015-05-10',
            'relationship' => 'invalid',
        ])
        ->assertSessionHasErrors('relationship');
});
