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
        'draft_expires_at' => now()->addMinutes(30),
        'draft_token' => 'test-token',
        'stripe_payment_intent_id' => null,
    ]);
});

it('creates a payment intent for an authenticated user', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_test123',
        'client_secret' => 'pi_test123_secret_xxx',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => ['client_secret', 'amount', 'currency'],
        ]);

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'stripe_payment_intent_id' => 'pi_test123',
    ]);
});

it('creates a payment intent for a guest booking', function () {
    $this->booking->update([
        'user_id' => null,
        'is_guest_booking' => true,
        'guest_email' => 'guest@example.com',
    ]);

    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_guest123',
        'client_secret' => 'pi_guest123_secret_xxx',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
});

it('returns 404 for wrong user booking', function () {
    $otherUser = User::factory()->asPatient()->create();

    $this->mock(StripeService::class);

    $response = $this->actingAs($otherUser)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertStatus(404)
        ->assertJson(['success' => false]);
});

it('returns 422 for expired draft', function () {
    $this->booking->update(['draft_expires_at' => now()->subMinutes(5)]);

    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);
    expect(strtolower($response->json('message')))->toContain('expired');
});

it('returns 422 for non-pending booking', function () {
    $confirmedStatus = BookingStatus::confirmed();
    $this->booking->update(['status_id' => $confirmedStatus->id]);

    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);
    expect(strtolower($response->json('message')))->toContain('pending');
});

it('returns 500 when Stripe fails', function () {
    $this->mock(StripeService::class, function ($mock) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andThrow(new \RuntimeException('Stripe error'));
    });

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertStatus(500)
        ->assertJson(['success' => false]);

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'stripe_payment_intent_id' => null,
    ]);
});

it('does not update booking when Stripe fails', function () {
    $this->mock(StripeService::class, function ($mock) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andThrow(new \RuntimeException('Stripe connection error'));
    });

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertStatus(500);

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'stripe_payment_intent_id' => null,
    ]);
});

it('correctly rounds pence amount for 19.99', function () {
    $this->booking->update(['grand_total_cost' => 19.99]);

    $capturedAmount = null;
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_round123',
        'client_secret' => 'pi_round123_secret_xxx',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use (&$capturedAmount, $mockPaymentIntent) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->withArgs(function ($amount) use (&$capturedAmount) {
                $capturedAmount = $amount;

                return true;
            })
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => $this->booking->id,
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
    expect($capturedAmount)->toBe(1999);
});

it('rejects missing booking_id', function () {
    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['booking_id']);
});

it('rejects nonexistent booking_id', function () {
    $this->mock(StripeService::class);

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'booking_id' => 'nonexistent-id',
    ]);

    $response->assertUnprocessable();
});

it('accepts draftId alias', function () {
    $mockPaymentIntent = \Stripe\PaymentIntent::constructFrom([
        'id' => 'pi_alias123',
        'client_secret' => 'pi_alias123_secret_xxx',
        'object' => 'payment_intent',
    ]);

    $this->mock(StripeService::class, function ($mock) use ($mockPaymentIntent) {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andReturn($mockPaymentIntent);
    });

    $response = $this->actingAs($this->user)->postJson('/api/booking-drafts/payment-intent', [
        'draftId' => $this->booking->id,
    ]);

    $response->assertSuccessful()
        ->assertJson(['success' => true]);
});
