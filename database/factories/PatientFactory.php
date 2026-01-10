<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        $allergies = [
            'No known allergies',
            'Penicillin',
            'Latex gloves',
            'Iodine',
            'Aspirin',
            'Nuts',
        ];

        $medications = [
            'None',
            'Aspirin 75mg daily',
            'Metformin 500mg twice daily',
            'Atorvastatin 20mg nightly',
            'Levothyroxine 100mcg daily',
            'Ramipril 5mg daily',
        ];

        $conditions = [
            'None',
            'Hypertension',
            'Type 2 Diabetes',
            'Hypothyroidism',
            'Asthma',
        ];

        return [
            'user_id' => User::factory(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-18 years'),
            'address_line1' => fake()->streetAddress(),
            'address_line2' => fake()->optional(0.3)->secondaryAddress(),
            'town_city' => fake()->city(),
            'postcode' => fake()->regexify('[A-Z]{1,2}[0-9]{1,2} [0-9][A-Z]{2}'), // UK postcode format
            'nhs_number' => fake()->unique()->regexify('[0-9]{3} [0-9]{3} [0-9]{4}'), // NHS number format
            'known_blood_type' => fake()->optional(0.6)->randomElement($bloodTypes),
            'known_allergies' => fake()->optional(0.7)->randomElement($allergies),
            'current_medications' => fake()->optional(0.5)->randomElement($medications),
            'medical_conditions' => fake()->optional(0.4)->randomElement($conditions),
            'internal_notes' => fake()->optional(0.2)->sentence(),
        ];
    }

    /**
     * Indicate that the patient has complete medical information.
     */
    public function withCompleteMedicalInfo(): static
    {
        return $this->state(fn (array $attributes) => [
            'known_blood_type' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'known_allergies' => 'Penicillin, Latex',
            'current_medications' => 'Aspirin 75mg daily, Metformin 500mg twice daily',
            'medical_conditions' => 'Type 2 Diabetes, Hypertension',
        ]);
    }

    /**
     * Indicate that the patient has no medical information.
     */
    public function withoutMedicalInfo(): static
    {
        return $this->state(fn (array $attributes) => [
            'known_blood_type' => null,
            'known_allergies' => null,
            'current_medications' => null,
            'medical_conditions' => null,
        ]);
    }

    /**
     * Indicate that the patient is a minor (under 18).
     */
    public function minor(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => fake()->dateTimeBetween('-17 years', '-1 year'),
        ]);
    }

    /**
     * Indicate that the patient is elderly (over 65).
     */
    public function elderly(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => fake()->dateTimeBetween('-90 years', '-65 years'),
        ]);
    }
}
