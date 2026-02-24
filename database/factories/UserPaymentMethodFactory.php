<?php

namespace Database\Factories;

use App\Models\UserPaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserPaymentMethod>
 */
class UserPaymentMethodFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = UserPaymentMethod::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = ['visa', 'mastercard', 'amex', 'discover'];
        $expYear = (int) fake()->dateTimeBetween('now', '+5 years')->format('Y');
        $expMonth = fake()->numberBetween(1, 12);

        return [
            'user_id' => \App\Models\User::factory(),
            'stripe_payment_method_id' => 'pm_'.fake()->regexify('[a-zA-Z0-9]{24}'),
            'stripe_customer_id' => 'cus_'.fake()->regexify('[a-zA-Z0-9]{14}'),
            'card_brand' => fake()->randomElement($brands),
            'card_last_four' => fake()->numerify('####'),
            'card_exp_month' => $expMonth,
            'card_exp_year' => $expYear,
            'is_default' => false,
        ];
    }

    /**
     * Indicate that the payment method is the default.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Indicate that the card is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'card_exp_month' => fake()->numberBetween(1, 12),
            'card_exp_year' => (int) fake()->dateTimeBetween('-5 years', '-1 year')->format('Y'),
        ]);
    }
}
