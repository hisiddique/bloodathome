<?php

namespace Database\Factories;

use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCode>
 */
class PromoCodeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = PromoCode::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $discountType = fake()->randomElement(['percentage', 'fixed']);
        $discountValue = $discountType === 'percentage'
            ? fake()->randomFloat(2, 5.00, 50.00)
            : fake()->randomFloat(2, 5.00, 50.00);

        $maxDiscount = $discountType === 'percentage'
            ? fake()->optional(0.6)->randomFloat(2, 20.00, 100.00)
            : null;

        $validFrom = fake()->dateTimeBetween('-3 months', 'now');

        return [
            'code' => strtoupper(Str::random(8)),
            'description' => fake()->sentence(),
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'min_order_amount' => fake()->randomFloat(2, 0, 50.00),
            'max_discount_amount' => $maxDiscount,
            'usage_limit' => fake()->optional(0.7)->numberBetween(10, 1000),
            'usage_count' => 0,
            'per_user_limit' => fake()->numberBetween(1, 5),
            'valid_from' => $validFrom,
            'valid_until' => fake()->optional(0.8)->dateTimeBetween($validFrom, '+6 months'),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the promo code is a percentage discount.
     */
    public function percentage(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'percentage',
            'discount_value' => fake()->randomFloat(2, 5.00, 50.00),
            'max_discount_amount' => fake()->randomFloat(2, 10.00, 100.00),
        ]);
    }

    /**
     * Indicate that the promo code is a fixed amount discount.
     */
    public function fixedAmount(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'fixed',
            'discount_value' => fake()->randomFloat(2, 5.00, 50.00),
            'max_discount_amount' => null,
        ]);
    }

    /**
     * Indicate that the promo code is currently active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'valid_from' => fake()->dateTimeBetween('-1 month', 'now'),
            'valid_until' => fake()->dateTimeBetween('now', '+3 months'),
        ]);
    }

    /**
     * Indicate that the promo code is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'valid_from' => fake()->dateTimeBetween('-6 months', '-3 months'),
            'valid_until' => fake()->dateTimeBetween('-2 months', '-1 day'),
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the promo code is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a first-time user promo code.
     */
    public function firstTimeUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'WELCOME'.strtoupper(Str::random(4)),
            'description' => 'Welcome discount for first-time users',
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'max_discount_amount' => 25.00,
            'per_user_limit' => 1,
        ]);
    }

    /**
     * Create a seasonal promotion promo code.
     */
    public function seasonal(): static
    {
        $seasons = ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN'];

        return $this->state(fn (array $attributes) => [
            'code' => fake()->randomElement($seasons).fake()->year(),
            'description' => 'Seasonal promotion discount',
            'discount_type' => 'percentage',
            'discount_value' => fake()->randomFloat(2, 10.00, 30.00),
            'usage_limit' => fake()->numberBetween(100, 1000),
        ]);
    }

    /**
     * Create a limited use promo code.
     */
    public function limitedUse(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_limit' => fake()->numberBetween(5, 50),
            'per_user_limit' => 1,
        ]);
    }

    /**
     * Create an unlimited use promo code.
     */
    public function unlimitedUse(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_limit' => null,
            'per_user_limit' => fake()->numberBetween(3, 10),
        ]);
    }

    /**
     * Create a high value promo code.
     */
    public function highValue(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'fixed',
            'discount_value' => fake()->randomFloat(2, 30.00, 100.00),
            'min_order_amount' => fake()->randomFloat(2, 100.00, 200.00),
        ]);
    }

    /**
     * Indicate that the promo code has been fully used.
     */
    public function fullyUsed(): static
    {
        return $this->state(function (array $attributes) {
            $limit = fake()->numberBetween(10, 100);

            return [
                'usage_limit' => $limit,
                'usage_count' => $limit,
                'is_active' => false,
            ];
        });
    }
}
