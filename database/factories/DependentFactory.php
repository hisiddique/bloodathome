<?php

namespace Database\Factories;

use App\Models\Dependent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Dependent>
 */
class DependentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Dependent::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $relationships = ['child', 'spouse', 'parent', 'other'];

        $allergies = [
            'No known allergies',
            'Penicillin',
            'Latex',
            'Iodine',
            'Aspirin',
            'Peanuts',
            'Shellfish',
        ];

        $medications = [
            'None',
            'Paracetamol as needed',
            'Ibuprofen as needed',
            'Amoxicillin',
            'Insulin',
            'Inhaler for asthma',
        ];

        $conditions = [
            'None',
            'Asthma',
            'Diabetes Type 1',
            'Eczema',
            'ADHD',
            'Allergic rhinitis',
        ];

        return [
            'user_id' => User::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-1 year'),
            'relationship' => fake()->randomElement($relationships),
            'nhs_number' => fake()->optional(0.6)->regexify('[0-9]{10}'),
            'allergies' => fake()->optional(0.5)->randomElement($allergies),
            'medical_conditions' => fake()->optional(0.4)->randomElement($conditions),
            'medications' => fake()->optional(0.3)->randomElement($medications),
        ];
    }

    /**
     * Indicate that the dependent is a child (under 18).
     */
    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => fake()->dateTimeBetween('-17 years', '-1 year'),
            'relationship' => 'child',
        ]);
    }

    /**
     * Indicate that the dependent is an adult (18 or over).
     */
    public function adult(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-18 years'),
            'relationship' => fake()->randomElement(['spouse', 'parent', 'other']),
        ]);
    }
}
