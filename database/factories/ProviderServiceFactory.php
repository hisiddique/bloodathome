<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\ProviderService;
use App\Models\Service;
use App\Models\ServiceActiveStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProviderService>
 */
class ProviderServiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = ProviderService::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 years', 'now');

        return [
            'provider_id' => Provider::factory(),
            'service_id' => Service::factory(),
            'base_cost' => fake()->randomFloat(2, 20.00, 150.00),
            'agreed_commission_percent' => fake()->randomFloat(2, 10.00, 30.00),
            'start_date' => $startDate,
            'end_date' => fake()->optional(0.2)->dateTimeBetween($startDate, '+1 year'),
            'status_id' => ServiceActiveStatus::inRandomOrder()->first()?->id ?? 1,
        ];
    }

    /**
     * Indicate that the provider service is currently active.
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = ServiceActiveStatus::where('name', 'Active')->first()?->id ?? 1;

            return [
                'status_id' => $statusId,
                'start_date' => fake()->dateTimeBetween('-1 year', 'now'),
                'end_date' => null,
            ];
        });
    }

    /**
     * Indicate that the provider service is inactive.
     */
    public function inactive(): static
    {
        return $this->state(function (array $attributes) {
            $statusId = ServiceActiveStatus::where('name', 'Inactive')->first()?->id ?? 2;

            return [
                'status_id' => $statusId,
            ];
        });
    }

    /**
     * Indicate that the provider service has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => fake()->dateTimeBetween('-2 years', '-6 months'),
            'end_date' => fake()->dateTimeBetween('-5 months', '-1 month'),
        ]);
    }

    /**
     * Create a low-cost service.
     */
    public function lowCost(): static
    {
        return $this->state(fn (array $attributes) => [
            'base_cost' => fake()->randomFloat(2, 15.00, 40.00),
            'agreed_commission_percent' => fake()->randomFloat(2, 15.00, 25.00),
        ]);
    }

    /**
     * Create a high-cost service.
     */
    public function highCost(): static
    {
        return $this->state(fn (array $attributes) => [
            'base_cost' => fake()->randomFloat(2, 100.00, 250.00),
            'agreed_commission_percent' => fake()->randomFloat(2, 20.00, 35.00),
        ]);
    }

    /**
     * Create a provider service with low commission.
     */
    public function lowCommission(): static
    {
        return $this->state(fn (array $attributes) => [
            'agreed_commission_percent' => fake()->randomFloat(2, 5.00, 12.00),
        ]);
    }

    /**
     * Create a provider service with high commission.
     */
    public function highCommission(): static
    {
        return $this->state(fn (array $attributes) => [
            'agreed_commission_percent' => fake()->randomFloat(2, 25.00, 40.00),
        ]);
    }
}
