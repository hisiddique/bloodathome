<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\ProviderStatus;
use App\Models\ProviderType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Provider>
 */
class ProviderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Provider::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $latitude = fake()->latitude(50.0, 58.0); // UK latitude range
        $longitude = fake()->longitude(-8.0, 2.0); // UK longitude range

        $bios = [
            'Experienced phlebotomist with over {years} years in blood collection services. Committed to providing comfortable and professional care.',
            'Qualified healthcare professional specializing in blood tests and sample collection. Patient-focused approach with excellent bedside manner.',
            'NHS-trained phlebotomist offering convenient at-home blood testing services. Gentle technique and thorough attention to detail.',
            'Professional blood collection specialist with expertise in pediatric and adult phlebotomy. Making healthcare accessible and stress-free.',
        ];

        $experienceYears = fake()->numberBetween(1, 25);

        return [
            'user_id' => User::factory(),
            'type_id' => ProviderType::inRandomOrder()->first()?->id ?? 1,
            'status_id' => ProviderStatus::inRandomOrder()->first()?->id ?? 1,
            'provider_name' => fake()->optional(0.7)->company(),
            'address_line1' => fake()->streetAddress(),
            'address_line2' => fake()->optional(0.3)->secondaryAddress(),
            'town_city' => fake()->city(),
            'postcode' => fake()->regexify('[A-Z]{1,2}[0-9]{1,2} [0-9][A-Z]{2}'),
            'latitude' => $latitude,
            'longitude' => $longitude,
            'location' => null, // Geometry field - set separately if needed
            'profile_thumbnail_url' => fake()->optional(0.5)->imageUrl(200, 200, 'people'),
            'bio' => str_replace('{years}', $experienceYears, fake()->randomElement($bios)),
            'experience_years' => $experienceYears,
            'average_rating' => fake()->randomFloat(2, 3.5, 5.0),
            'total_reviews' => fake()->numberBetween(0, 500),
            'provider_notes' => fake()->optional(0.2)->sentence(),
        ];
    }

    /**
     * Indicate that the provider is an individual phlebotomist.
     */
    public function individual(): static
    {
        return $this->state(function (array $attributes) {
            $typeId = ProviderType::where('name', 'Individual')->first()?->id ?? 1;

            return [
                'type_id' => $typeId,
                'provider_name' => null,
            ];
        });
    }

    /**
     * Indicate that the provider is a laboratory.
     */
    public function laboratory(): static
    {
        return $this->state(function (array $attributes) {
            $typeId = ProviderType::where('name', 'Laboratory')->first()?->id ?? 2;

            return [
                'type_id' => $typeId,
                'provider_name' => fake()->company().' Laboratory',
            ];
        });
    }

    /**
     * Indicate that the provider is a clinic.
     */
    public function clinic(): static
    {
        return $this->state(function (array $attributes) {
            $typeId = ProviderType::where('name', 'Clinic')->first()?->id ?? 3;

            return [
                'type_id' => $typeId,
                'provider_name' => fake()->company().' Clinic',
            ];
        });
    }

    /**
     * Indicate that the provider is active.
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = ProviderStatus::where('name', 'Active')->first()?->id ?? 1;

            return [
                'status_id' => $statusId,
            ];
        });
    }

    /**
     * Indicate that the provider is inactive.
     */
    public function inactive(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = ProviderStatus::where('name', 'Inactive')->first()?->id ?? 2;

            return [
                'status_id' => $statusId,
            ];
        });
    }

    /**
     * Indicate that the provider has high ratings.
     */
    public function highlyRated(): static
    {
        return $this->state(fn (array $attributes) => [
            'average_rating' => fake()->randomFloat(2, 4.5, 5.0),
            'total_reviews' => fake()->numberBetween(100, 500),
        ]);
    }

    /**
     * Indicate that the provider is new with no reviews.
     */
    public function newProvider(): static
    {
        return $this->state(fn (array $attributes) => [
            'average_rating' => 0,
            'total_reviews' => 0,
            'experience_years' => fake()->numberBetween(1, 3),
        ]);
    }

    /**
     * Indicate that the provider is very experienced.
     */
    public function experienced(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_years' => fake()->numberBetween(10, 25),
            'average_rating' => fake()->randomFloat(2, 4.0, 5.0),
            'total_reviews' => fake()->numberBetween(200, 500),
        ]);
    }
}
