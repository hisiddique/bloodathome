<?php

use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\CollectionType;
use App\Models\Provider;
use App\Models\ProviderService;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\BookingStatusSeeder;
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
        BookingStatusSeeder::class,
        CollectionTypeSeeder::class,
        ProviderTypeSeeder::class,
        ProviderStatusSeeder::class,
        ServiceCategorySeeder::class,
        ServiceActiveStatusSeeder::class,
    ]);

    $this->user = User::factory()->asPatient()->create();
    $this->provider = Provider::factory()->active()->create();
    $this->service = Service::factory()->active()->create();
    $this->providerService = ProviderService::factory()->active()->create([
        'provider_id' => $this->provider->id,
        'service_id' => $this->service->id,
        'base_cost' => 50.00,
    ]);
});

function validDraftPayload(string $providerId, array $serviceIds, array $overrides = []): array
{
    return array_merge([
        'collection_type' => 'home_visit',
        'is_nhs_test' => false,
        'service_ids' => $serviceIds,
        'location' => [
            'postcode' => 'SW1A 1AA',
            'address' => '10 Downing Street',
            'city' => 'London',
        ],
        'selected_date' => now()->addDays(2)->format('Y-m-d'),
        'time_of_day' => 'morning',
        'provider_id' => $providerId,
    ], $overrides);
}

it('creates a draft for an authenticated user', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful()
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => ['booking_id', 'draft_token', 'expires_at', 'total_cost'],
        ]);

    $this->assertDatabaseHas('bookings', [
        'user_id' => $this->user->id,
        'provider_id' => $this->provider->id,
    ]);
});

it('creates a draft for a guest user', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'guest_name' => 'Jane Doe',
        'guest_email' => 'jane@example.com',
        'guest_phone' => '07700900000',
    ]);

    $response = $this->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('bookings', [
        'is_guest_booking' => true,
        'guest_email' => 'jane@example.com',
        'guest_name' => 'Jane Doe',
    ]);
});

it('creates a draft with multiple services', function () {
    $service2 = Service::factory()->active()->create();
    ProviderService::factory()->active()->create([
        'provider_id' => $this->provider->id,
        'service_id' => $service2->id,
        'base_cost' => 30.00,
    ]);

    $payload = validDraftPayload($this->provider->id, [$this->service->id, $service2->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
    // Subtotal £80 + 5% service fee (£4) + 20% VAT on £84 (£16.80) = £100.80
    expect($response->json('data.total_cost'))->toEqual(100.8);
});

it('rejects draft without provider_id', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id]);
    unset($payload['provider_id']);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['provider_id']);
});

it('rejects draft without service_ids', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id]);
    unset($payload['service_ids']);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['service_ids']);
});

it('rejects draft with empty service_ids array', function () {
    $payload = validDraftPayload($this->provider->id, []);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['service_ids']);
});

it('rejects draft with invalid collection_type', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'collection_type' => 'invalid_type',
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['collection_type']);
});

it('rejects draft with past scheduled_date', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'selected_date' => now()->subDay()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['scheduled_date']);
});

it('rejects guest draft without guest_email', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'guest_name' => 'Jane Doe',
        'guest_phone' => '07700900000',
        // guest_email intentionally missing
    ]);

    $response = $this->postJson('/api/booking-drafts', $payload);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['guest_email']);
});

it('returns 422 when provider does not exist', function () {
    $payload = validDraftPayload('nonexistent-provider-id', [$this->service->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    // provider_id has exists:providers,id rule so validation rejects before the controller body.
    // Laravel's FormRequest validation response does not include a 'success' key.
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['provider_id']);
});

it('rejects updating another user draft', function () {
    $otherUser = User::factory()->asPatient()->create();
    $pendingStatus = BookingStatus::pending();

    $booking = Booking::factory()->create([
        'user_id' => $otherUser->id,
        'provider_id' => $this->provider->id,
        'status_id' => $pendingStatus->id,
        'collection_type_id' => CollectionType::where('name', 'Home Visit')->first()->id,
        'scheduled_date' => now()->addDays(2),
        'time_slot' => '09:00',
        'draft_expires_at' => now()->addMinutes(30),
    ]);

    $payload = validDraftPayload($this->provider->id, [$this->service->id]);

    $response = $this->actingAs($this->user)->patchJson("/api/booking-drafts/{$booking->id}", $payload);

    $response->assertForbidden()
        ->assertJson(['success' => false]);
});

it('rejects updating an expired draft', function () {
    $pendingStatus = BookingStatus::pending();

    $booking = Booking::factory()->create([
        'user_id' => $this->user->id,
        'provider_id' => $this->provider->id,
        'status_id' => $pendingStatus->id,
        'collection_type_id' => CollectionType::where('name', 'Home Visit')->first()->id,
        'scheduled_date' => now()->addDays(2),
        'time_slot' => '09:00',
        'draft_expires_at' => now()->subMinutes(5), // Expired
    ]);

    $payload = validDraftPayload($this->provider->id, [$this->service->id]);

    $response = $this->actingAs($this->user)->patchJson("/api/booking-drafts/{$booking->id}", $payload);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);
    expect(strtolower($response->json('message')))->toContain('expired');
});

it('rejects updating a non-pending draft', function () {
    $confirmedStatus = BookingStatus::confirmed();

    $booking = Booking::factory()->create([
        'user_id' => $this->user->id,
        'provider_id' => $this->provider->id,
        'status_id' => $confirmedStatus->id,
        'collection_type_id' => CollectionType::where('name', 'Home Visit')->first()->id,
        'scheduled_date' => now()->addDays(2),
        'time_slot' => '09:00',
        'draft_expires_at' => now()->addMinutes(30),
    ]);

    $payload = validDraftPayload($this->provider->id, [$this->service->id]);

    $response = $this->actingAs($this->user)->patchJson("/api/booking-drafts/{$booking->id}", $payload);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);
    expect(strtolower($response->json('message')))->toContain('pending');
});

it('creates booking items for each service', function () {
    $service2 = Service::factory()->active()->create();
    ProviderService::factory()->active()->create([
        'provider_id' => $this->provider->id,
        'service_id' => $service2->id,
        'base_cost' => 30.00,
    ]);

    $payload = validDraftPayload($this->provider->id, [$this->service->id, $service2->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);

    $this->assertDatabaseCount('booking_items', 2);
});

it('sets draft_expires_at approximately 30 minutes ahead', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
    $bookingId = $response->json('data.booking_id');
    $booking = Booking::find($bookingId);

    expect($booking->draft_expires_at)->not->toBeNull();
    // Should be roughly 30 minutes from now (allow 2 minute tolerance)
    $diffMinutes = now()->diffInMinutes($booking->draft_expires_at);
    expect($diffMinutes)->toBeGreaterThanOrEqual(28)->toBeLessThanOrEqual(31);
});

it('returns 422 when services not from provider', function () {
    $otherService = Service::factory()->active()->create();
    // Note: otherService is NOT linked to $this->provider

    $payload = validDraftPayload($this->provider->id, [$otherService->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);
});

it('does not create booking when services mismatch', function () {
    $otherService = Service::factory()->active()->create();
    // Note: otherService is NOT linked to $this->provider

    $payload = validDraftPayload($this->provider->id, [$otherService->id]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    $this->assertDatabaseCount('bookings', 0);
});

it('updates draft with new services and replaces booking items', function () {
    // Create the initial draft with one service
    $createPayload = validDraftPayload($this->provider->id, [$this->service->id]);
    $createResponse = $this->actingAs($this->user)->postJson('/api/booking-drafts', $createPayload);
    $createResponse->assertSuccessful();

    $bookingId = $createResponse->json('data.booking_id');
    $this->assertDatabaseCount('booking_items', 1);

    // Create a second service for the same provider
    $service2 = Service::factory()->active()->create();
    ProviderService::factory()->active()->create([
        'provider_id' => $this->provider->id,
        'service_id' => $service2->id,
        'base_cost' => 75.00,
    ]);

    // PATCH with only the new service (replacing the original)
    $updatePayload = validDraftPayload($this->provider->id, [$service2->id]);
    $updateResponse = $this->actingAs($this->user)->patchJson("/api/booking-drafts/{$bookingId}", $updatePayload);

    $updateResponse->assertSuccessful()
        ->assertJson(['success' => true]);

    // Only the new service's booking item should remain
    $this->assertDatabaseCount('booking_items', 1);

    // The remaining item belongs to service2's provider service
    $providerService2 = ProviderService::where('service_id', $service2->id)
        ->where('provider_id', $this->provider->id)
        ->first();

    $this->assertDatabaseHas('booking_items', [
        'booking_id' => $bookingId,
        'catalog_id' => $providerService2->id,
    ]);

    // The original service's booking item should be gone
    $this->assertDatabaseMissing('booking_items', [
        'booking_id' => $bookingId,
        'catalog_id' => $this->providerService->id,
    ]);
});

it('stores address fields correctly from top-level service_address fields', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'location' => [
            'postcode' => 'SW1A 1AA',
            'address' => '10 Downing Street, London, SW1A 1AA',
            'address_line1' => '10 Downing Street',
            'address_line2' => 'Flat 1',
            'city' => 'London',
        ],
        'service_address_line1' => '10 Downing Street',
        'service_address_line2' => 'Flat 1',
        'service_town_city' => 'London',
        'service_postcode' => 'SW1A 1AA',
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful();

    $this->assertDatabaseHas('bookings', [
        'service_address_line1' => '10 Downing Street',
        'service_address_line2' => 'Flat 1',
        'service_town_city' => 'London',
        'service_postcode' => 'SW1A 1AA',
    ]);
});

it('does not store city in service_address_line1 when location.address_line1 is provided', function () {
    $payload = validDraftPayload($this->provider->id, [$this->service->id], [
        'location' => [
            'postcode' => 'E1 6AN',
            'address' => 'London',
            'address_line1' => '221B Baker Street',
            'city' => 'London',
        ],
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts', $payload);

    $response->assertSuccessful();

    // service_address_line1 should be the street address, NOT 'London'
    $this->assertDatabaseHas('bookings', [
        'service_address_line1' => '221B Baker Street',
        'service_town_city' => 'London',
    ]);

    $this->assertDatabaseMissing('bookings', [
        'service_address_line1' => 'London',
    ]);
});
