<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $services = [
            'Full Blood Count (FBC)',
            'Lipid Profile',
            'HbA1c (Diabetes)',
            'Thyroid Function Test (TFT)',
            'Liver Function Test (LFT)',
            'Kidney Function Test (U&E)',
            'Vitamin D Test',
            'Vitamin B12 & Folate',
            'Iron Studies',
            'PSA (Prostate)',
            'Testosterone Test',
            'Cholesterol Check',
            'Blood Glucose Test',
            'CRP (Inflammation)',
            'Coeliac Screen',
        ];

        $serviceName = fake()->unique()->randomElement($services);
        $serviceCode = strtoupper(Str::slug($serviceName, '_'));

        $descriptions = [
            'Comprehensive blood analysis to assess overall health and detect abnormalities.',
            'Standard diagnostic test to evaluate specific health markers and conditions.',
            'Essential screening test for early detection and monitoring of health conditions.',
            'Detailed blood work to measure key biomarkers and support clinical diagnosis.',
        ];

        return [
            'service_category_id' => ServiceCategory::inRandomOrder()->first()?->id ?? 1,
            'service_name' => $serviceName,
            'service_code' => $serviceCode,
            'service_description' => fake()->randomElement($descriptions),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the service is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the service is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a service with a specific category.
     */
    public function forCategory(int $categoryId): static
    {
        return $this->state(fn (array $attributes) => [
            'service_category_id' => $categoryId,
        ]);
    }
}
