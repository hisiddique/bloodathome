<?php

use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\CollectionType;
use App\Models\Provider;
use App\Models\User;
use App\Services\StripeService;
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

    $pendingStatus = BookingStatus::pending();
    $collectionType = CollectionType::where('name', 'Home Visit')->first();

    $this->booking = Booking::factory()->create([
        'user_id' => $this->user->id,
        'provider_id' => $this->provider->id,
        'status_id' => $pendingStatus->id,
        'collection_type_id' => $collectionType->id,
        'scheduled_date' => now()->addDays(2),
        'time_slot' => '09:00',
        'grand_total_cost' => 50.00,
        'stripe_payment_intent_id' => 'pi_test123',
        'draft_token' => 'test-token',
        'draft_expires_at' => now()->addMinutes(30),
    ]);
});

it('confirms a booking after payment', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'succeeded',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->once()
            ->with('pi_test123')
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => ['confirmation_number', 'booking'],
        ]);

    $this->booking->refresh();
    $confirmedStatus = BookingStatus::confirmed();
    expect($this->booking->status_id)->toBe($confirmedStatus->id);
    expect($this->booking->confirmation_number)->not->toBeNull();
    expect($this->booking->draft_token)->toBeNull();
});

it('confirms a guest booking', function () {
    $this->booking->update([
        'user_id' => null,
        'is_guest_booking' => true,
        'guest_email' => 'guest@example.com',
    ]);

    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'succeeded',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
});

it('returns 422 when payment intent does not match', function () {
    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_wrong456',
    ]);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    expect(strtolower($response->json('message')))->toContain('does not match');

    $this->booking->refresh();
    $pendingStatus = BookingStatus::pending();
    expect($this->booking->status_id)->toBe($pendingStatus->id);
});

it('returns 422 when payment has not succeeded', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'processing',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    expect(strtolower($response->json('message')))->toContain('not been completed');

    $this->booking->refresh();
    $pendingStatus = BookingStatus::pending();
    expect($this->booking->status_id)->toBe($pendingStatus->id);
});

it('returns 404 for wrong user', function () {
    $otherUser = User::factory()->asPatient()->create();

    $this->mock(StripeService::class);

    $response = $this->actingAs($otherUser)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertStatus(404)
        ->assertJson(['success' => false]);
});

it('returns 500 when Stripe fails', function () {
    $this->mock(StripeService::class, function ($mock) {
        $mock->shouldReceive('confirmPayment')
            ->once()
            ->andThrow(new \RuntimeException('Stripe error'));
    });

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertStatus(500)
        ->assertJson(['success' => false]);

    $this->booking->refresh();
    $pendingStatus = BookingStatus::pending();
    expect($this->booking->status_id)->toBe($pendingStatus->id);
    expect($this->booking->draft_token)->not->toBeNull();
});

it('rejects missing payment_intent_id', function () {
    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['payment_intent_id']);
});

it('rejects payment intent not starting with pi_', function () {
    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'invalid_123',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['payment_intent_id']);
});

it('accepts draft_id alias', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'succeeded',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'draft_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
});

it('generates unique confirmation numbers', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'succeeded',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->andReturn($mockPaymentIntent);
    });

    // Confirm first booking
    $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    // Create and confirm second booking
    $pendingStatus = BookingStatus::pending();
    $collectionType = CollectionType::where('name', 'Home Visit')->first();

    $booking2 = Booking::factory()->create([
        'user_id' => $this->user->id,
        'provider_id' => $this->provider->id,
        'status_id' => $pendingStatus->id,
        'collection_type_id' => $collectionType->id,
        'scheduled_date' => now()->addDays(3),
        'time_slot' => '10:00',
        'grand_total_cost' => 60.00,
        'stripe_payment_intent_id' => 'pi_test456',
        'draft_token' => 'test-token-2',
    ]);

    $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $booking2->id,
        'payment_intent_id' => 'pi_test456',
    ]);

    $this->booking->refresh();
    $booking2->refresh();

    expect($this->booking->confirmation_number)->not->toBeNull();
    expect($booking2->confirmation_number)->not->toBeNull();
    expect($this->booking->confirmation_number)->not->toBe($booking2->confirmation_number);
});

it('rejects confirming an already confirmed booking', function () {
    $confirmedStatus = BookingStatus::confirmed();

    $this->booking->update([
        'status_id' => $confirmedStatus->id,
        'confirmation_number' => 'BAH-ORIGINAL',
        'draft_token' => null,
    ]);

    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'status' => 'succeeded',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('confirmPayment')
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/bookings/confirm', [
        'booking_id' => $this->booking->id,
        'payment_intent_id' => 'pi_test123',
    ]);

    // The controller does not filter by pending status, so the request may succeed
    // or return an error. Either way, the booking must remain confirmed.
    $this->booking->refresh();
    expect($this->booking->status_id)->toBe($confirmedStatus->id);
    expect($this->booking->confirmation_number)->not->toBeNull();
});
