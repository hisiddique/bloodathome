<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserAddress>
 */
class UserAddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'label' => fake()->randomElement(['Home', 'Work', 'Parents House', 'Office']),
            'address_line1' => fake()->streetAddress(),
            'address_line2' => fake()->optional()->secondaryAddress(),
            'town_city' => fake()->city(),
            'postcode' => fake()->postcode(),
            'latitude' => fake()->optional()->latitude(50, 60),
            'longitude' => fake()->optional()->longitude(-5, 2),
            'is_default' => false,
        ];
    }
}
