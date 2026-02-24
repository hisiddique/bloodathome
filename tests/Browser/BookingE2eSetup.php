<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\UserAddress;
use Database\Seeders\BookingStatusSeeder;
use Database\Seeders\CollectionTypeSeeder;
use Database\Seeders\PaymentStatusSeeder;
use Database\Seeders\ProviderStatusSeeder;
use Database\Seeders\ProviderTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\ServiceActiveStatusSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\ServiceCollectionMappingSeeder;
use Database\Seeders\ServiceSeeder;
use Database\Seeders\SettlementStatusSeeder;
use Database\Seeders\TestUsersSeeder;
use Database\Seeders\VerificationStatusSeeder;

trait BookingE2eSetup
{
    /**
     * Disable Vite hot module replacement so the browser tests
     * use the pre-built assets in public/build/ instead of
     * trying to connect to the Vite dev server.
     */
    protected function disableViteHmr(): void
    {
        $hotFile = public_path('hot');

        if (file_exists($hotFile)) {
            rename($hotFile, $hotFile.'.bak');

            // Restore after the test
            register_shutdown_function(function () use ($hotFile) {
                if (file_exists($hotFile.'.bak')) {
                    rename($hotFile.'.bak', $hotFile);
                }
            });
        }
    }

    protected function seedBookingData(): void
    {
        $this->seed([
            BookingStatusSeeder::class,
            PaymentStatusSeeder::class,
            SettlementStatusSeeder::class,
            VerificationStatusSeeder::class,
            ProviderTypeSeeder::class,
            ServiceActiveStatusSeeder::class,
            ProviderStatusSeeder::class,
            CollectionTypeSeeder::class,
            ServiceCategorySeeder::class,
            RoleAndPermissionSeeder::class,
            ServiceSeeder::class,
            ServiceCollectionMappingSeeder::class,
            TestUsersSeeder::class,
        ]);
    }

    protected function createPatientWithAddress(): User
    {
        $user = User::where('email', 'patient@bloodathome.com')->first();

        UserAddress::factory()->create([
            'user_id' => $user->id,
            'label' => 'Home',
            'address_line1' => '10 Downing Street',
            'address_line2' => null,
            'town_city' => 'London',
            'postcode' => 'SW1A 2AA',
            'latitude' => 51.5034,
            'longitude' => -0.1276,
            'is_default' => true,
        ]);

        return $user;
    }

    /**
     * Get the next available weekday date (Mon-Fri) from today.
     * Skips today to ensure providers have availability.
     */
    protected function getNextWeekday(): \Carbon\Carbon
    {
        $date = now()->addDay();

        while ($date->isWeekend()) {
            $date->addDay();
        }

        return $date;
    }

    /**
     * Confirm a Stripe payment and booking server-side.
     *
     * Stripe PaymentElement uses cross-origin iframes that cause
     * Pest browser's withinFrame() to hang on networkidle.
     * This helper confirms the payment via Stripe PHP SDK
     * and the booking via the confirm API endpoint.
     *
     * @param  \Pest\Browser\Api\AwaitableWebpage  $page
     */
    protected function confirmPaymentServerSide($page): string
    {
        $draftId = $page->script("
            JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}').draftId || 'none'
        ");

        expect($draftId)->not->toBe('none');

        $booking = \App\Models\Booking::find($draftId);
        expect($booking)->not->toBeNull();
        expect($booking->stripe_payment_intent_id)->not->toBeNull();

        $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));
        $paymentIntent = $stripe->paymentIntents->confirm($booking->stripe_payment_intent_id, [
            'payment_method' => 'pm_card_visa',
            'return_url' => 'http://127.0.0.1:8000/book/success',
        ]);

        expect($paymentIntent->status)->toBe('succeeded');

        $response = $this->postJson('/api/bookings/confirm', [
            'payment_intent_id' => $paymentIntent->id,
            'draft_id' => $draftId,
        ]);

        $response->assertSuccessful();

        $confirmationNumber = $response->json('data.confirmation_number');

        $page->script("
            const state = JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}');
            state.step = 'success';
            state.confirmationNumber = '{$confirmationNumber}';
            localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
        ");

        return $confirmationNumber;
    }

    /**
     * Build localStorage booking state to inject into the browser
     * for skipping Google Maps autocomplete dependency.
     */
    protected function buildLocationState(string $postcode = 'SW1A 2AA'): string
    {
        $date = $this->getNextWeekday()->format('Y-m-d');

        $state = [
            'step' => 'location',
            'collectionType' => 'home_visit',
            'isNhsTest' => false,
            'selectedServices' => [],
            'location' => [
                'postcode' => $postcode,
                'address' => '10 Downing Street, London, SW1A 2AA',
                'lat' => 51.5034,
                'lng' => -0.1276,
                'addressLine1' => '10 Downing Street',
                'addressLine2' => '',
                'townCity' => 'London',
            ],
            'selectedDate' => $date.'T12:00:00.000Z',
            '_savedAt' => now()->timestamp * 1000,
        ];

        return json_encode($state);
    }
}
