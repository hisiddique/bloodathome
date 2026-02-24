<?php

use App\Models\Dependent;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class]);
    $this->user = User::factory()->asPatient()->create();
});

it('saves NHS number for user', function () {
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '1234567890',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $patient = Patient::where('user_id', $this->user->id)->first();
    expect($patient)->not->toBeNull();
    expect($patient->nhs_number)->toBe('1234567890');
});

it('updates patient record nhs number when patient already exists', function () {
    // Patient record is created by asPatient() factory; just verify the update works
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '9876543210',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $patient = Patient::where('user_id', $this->user->id)->first();
    expect($patient)->not->toBeNull();
    expect($patient->nhs_number)->toBe('9876543210');
});

it('rejects non-10-digit NHS number', function () {
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '12345',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nhs_number']);
});

it('rejects letters in NHS number', function () {
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => 'ABCDEFGHIJ',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nhs_number']);
});

it('rejects unauthenticated request', function () {
    $response = $this->patchJson('/api/nhs-number', [
        'nhs_number' => '1234567890',
    ]);

    // May be 401 or redirect depending on middleware
    expect($response->status())->toBeIn([401, 302, 419]);
});

it('saves NHS number for dependent', function () {
    $dependent = Dependent::create([
        'user_id' => $this->user->id,
        'first_name' => 'Child',
        'last_name' => 'Smith',
        'date_of_birth' => now()->subYears(10),
        'relationship' => 'child',
    ]);

    $response = $this->actingAs($this->user)->patchJson("/api/dependents/{$dependent->id}/nhs-number", [
        'nhs_number' => '1234567890',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $dependent->refresh();
    expect($dependent->nhs_number)->toBe('1234567890');
});

it('rejects dependent of other user', function () {
    $otherUser = User::factory()->asPatient()->create();
    $dependent = Dependent::create([
        'user_id' => $otherUser->id,
        'first_name' => 'Other',
        'last_name' => 'Child',
        'date_of_birth' => now()->subYears(10),
        'relationship' => 'child',
    ]);

    $response = $this->actingAs($this->user)->patchJson("/api/dependents/{$dependent->id}/nhs-number", [
        'nhs_number' => '1234567890',
    ]);

    $response->assertForbidden();
});

it('rejects duplicate NHS number', function () {
    Patient::create([
        'user_id' => User::factory()->create()->id,
        'nhs_number' => '1234567890',
        'date_of_birth' => '1990-01-01',
    ]);

    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '1234567890',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nhs_number']);

    $errors = $response->json('errors.nhs_number');
    expect(implode(' ', $errors))->toContain('already been taken');
});

it('does not change NHS number when validation fails', function () {
    $patient = $this->user->patient;
    $patient->update(['nhs_number' => '1234567890']);

    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => 'INVALID',
    ]);

    $response->assertUnprocessable();

    $patient->refresh();
    expect($patient->nhs_number)->toBe('1234567890');
});

it('rejects NHS number with spaces', function () {
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '123 456 890',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nhs_number']);
});

it('accepts NHS number with leading zeros', function () {
    $response = $this->actingAs($this->user)->patchJson('/api/nhs-number', [
        'nhs_number' => '0000000001',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $patient = Patient::where('user_id', $this->user->id)->first();
    expect($patient->nhs_number)->toBe('0000000001');
});
