<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\CollectionType;
use App\Models\PromoCode;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $timeSlots = [
            '08:00-09:00',
            '09:00-10:00',
            '10:00-11:00',
            '11:00-12:00',
            '12:00-13:00',
            '13:00-14:00',
            '14:00-15:00',
            '15:00-16:00',
            '16:00-17:00',
            '17:00-18:00',
        ];

        $visitInstructions = [
            'Please ring the doorbell. Flat is on the second floor.',
            'Park on the driveway. Front door access.',
            'Use the side entrance. Dog may bark but is friendly.',
            'Apartment building - use intercom code 1234.',
            null,
        ];

        $grandTotal = fake()->randomFloat(2, 50.00, 300.00);
        $discountAmount = fake()->optional(0.3)->randomFloat(2, 5.00, 50.00) ?? 0;

        return [
            'user_id' => User::factory(),
            'provider_id' => Provider::factory(),
            'status_id' => BookingStatus::inRandomOrder()->first()?->id ?? 1,
            'confirmation_number' => $this->generateConfirmationNumber(),
            'collection_type_id' => CollectionType::inRandomOrder()->first()?->id ?? 1,
            'nhs_number' => fake()->optional(0.7)->regexify('[0-9]{3} [0-9]{3} [0-9]{4}'),
            'scheduled_date' => fake()->dateTimeBetween('now', '+3 months'),
            'time_slot' => fake()->randomElement($timeSlots),
            'service_address_line1' => fake()->streetAddress(),
            'service_address_line2' => fake()->optional(0.3)->secondaryAddress(),
            'service_town_city' => fake()->city(),
            'service_postcode' => fake()->regexify('[A-Z]{1,2}[0-9]{1,2} [0-9][A-Z]{2}'),
            'grand_total_cost' => $grandTotal,
            'discount_amount' => $discountAmount,
            'promo_code_id' => $discountAmount > 0 ? PromoCode::inRandomOrder()->first()?->id : null,
            'stripe_payment_intent_id' => fake()->optional(0.8)->regexify('pi_[A-Za-z0-9]{24}'),
            'visit_instructions' => fake()->randomElement($visitInstructions),
            'patient_notes' => fake()->optional(0.3)->sentence(),
            'guardian_name' => fake()->optional(0.1)->name(),
            'guardian_confirmed' => false,
            'draft_token' => null,
            'draft_expires_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ];
    }

    /**
     * Generate a unique confirmation number.
     */
    protected function generateConfirmationNumber(): string
    {
        return 'BK'.strtoupper(Str::random(8));
    }

    /**
     * Indicate that the booking is pending.
     */
    public function pending(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = BookingStatus::where('name', 'Pending')->first()?->id ?? 1;

            return [
                'status_id' => $statusId,
                'scheduled_date' => fake()->dateTimeBetween('now', '+1 month'),
                'stripe_payment_intent_id' => null,
            ];
        });
    }

    /**
     * Indicate that the booking is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = BookingStatus::where('name', 'Confirmed')->first()?->id ?? 2;

            return [
                'status_id' => $statusId,
                'scheduled_date' => fake()->dateTimeBetween('now', '+1 month'),
                'stripe_payment_intent_id' => fake()->regexify('pi_[A-Za-z0-9]{24}'),
            ];
        });
    }

    /**
     * Indicate that the booking is completed.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = BookingStatus::where('name', 'Completed')->first()?->id ?? 3;

            return [
                'status_id' => $statusId,
                'scheduled_date' => fake()->dateTimeBetween('-6 months', '-1 day'),
                'stripe_payment_intent_id' => fake()->regexify('pi_[A-Za-z0-9]{24}'),
            ];
        });
    }

    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = BookingStatus::where('name', 'Cancelled')->first()?->id ?? 4;

            $cancellationReasons = [
                'Customer requested cancellation',
                'Provider unavailable',
                'Rescheduled to another date',
                'Patient illness',
                'Incorrect booking details',
            ];

            return [
                'status_id' => $statusId,
                'cancelled_at' => fake()->dateTimeBetween('-1 month', 'now'),
                'cancellation_reason' => fake()->randomElement($cancellationReasons),
            ];
        });
    }

    /**
     * Indicate that the booking is for a minor requiring guardian consent.
     */
    public function forMinor(): static
    {
        return $this->state(fn (array $attributes) => [
            'guardian_name' => fake()->name(),
            'guardian_confirmed' => true,
        ]);
    }

    /**
     * Indicate that the booking has a promo code applied.
     */
    public function withPromoCode(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_amount' => fake()->randomFloat(2, 10.00, 50.00),
            'promo_code_id' => PromoCode::inRandomOrder()->first()?->id ?? PromoCode::factory(),
        ]);
    }

    /**
     * Indicate that the booking is scheduled for today.
     */
    public function scheduledToday(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_date' => now()->toDateString(),
        ]);
    }

    /**
     * Indicate that the booking is in the past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_date' => fake()->dateTimeBetween('-6 months', '-1 day'),
        ]);
    }

    /**
     * Indicate that the booking is in the future.
     */
    public function future(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_date' => fake()->dateTimeBetween('+1 day', '+3 months'),
        ]);
    }
}
