<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Provider;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Review::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rating = fake()->numberBetween(1, 5);

        $reviewTexts = [
            1 => [
                'Very disappointed with the service. Would not recommend.',
                'Poor experience. Unprofessional and late.',
                'Not satisfied at all. Expected much better.',
            ],
            2 => [
                'Below average service. Several issues encountered.',
                'Not great. Had some problems during the appointment.',
                'Service needs improvement. Not happy with the experience.',
            ],
            3 => [
                'Acceptable service. Nothing special but got the job done.',
                'Average experience. Met basic expectations.',
                'Okay service. Could be better but not terrible.',
            ],
            4 => [
                'Good service overall. Professional and efficient.',
                'Very pleased with the experience. Would use again.',
                'Great service! Minor issues but generally positive.',
                'Friendly and professional. Happy with the outcome.',
            ],
            5 => [
                'Excellent service! Highly professional and caring.',
                'Outstanding experience. Could not be happier!',
                'Absolutely brilliant! Exceeded all expectations.',
                'Perfect service from start to finish. Highly recommend!',
                'Amazing! Best phlebotomist I have ever had.',
            ],
        ];

        return [
            'booking_id' => Booking::factory(),
            'user_id' => User::factory(),
            'provider_id' => Provider::factory(),
            'rating' => $rating,
            'review_text' => fake()->optional(0.8)->randomElement($reviewTexts[$rating]),
            'is_published' => fake()->boolean(85), // 85% chance of being published
        ];
    }

    /**
     * Indicate that the review is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    /**
     * Indicate that the review is unpublished.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Create a 5-star review.
     */
    public function fiveStars(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 5,
            'review_text' => fake()->randomElement([
                'Excellent service! Highly professional and caring.',
                'Outstanding experience. Could not be happier!',
                'Absolutely brilliant! Exceeded all expectations.',
                'Perfect service from start to finish. Highly recommend!',
                'Amazing! Best phlebotomist I have ever had.',
            ]),
        ]);
    }

    /**
     * Create a 4-star review.
     */
    public function fourStars(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 4,
            'review_text' => fake()->randomElement([
                'Good service overall. Professional and efficient.',
                'Very pleased with the experience. Would use again.',
                'Great service! Minor issues but generally positive.',
                'Friendly and professional. Happy with the outcome.',
            ]),
        ]);
    }

    /**
     * Create a 3-star review.
     */
    public function threeStars(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 3,
            'review_text' => fake()->randomElement([
                'Acceptable service. Nothing special but got the job done.',
                'Average experience. Met basic expectations.',
                'Okay service. Could be better but not terrible.',
            ]),
        ]);
    }

    /**
     * Create a 2-star review.
     */
    public function twoStars(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 2,
            'review_text' => fake()->randomElement([
                'Below average service. Several issues encountered.',
                'Not great. Had some problems during the appointment.',
                'Service needs improvement. Not happy with the experience.',
            ]),
        ]);
    }

    /**
     * Create a 1-star review.
     */
    public function oneStar(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 1,
            'review_text' => fake()->randomElement([
                'Very disappointed with the service. Would not recommend.',
                'Poor experience. Unprofessional and late.',
                'Not satisfied at all. Expected much better.',
            ]),
        ]);
    }

    /**
     * Create a review without text (rating only).
     */
    public function withoutText(): static
    {
        return $this->state(fn (array $attributes) => [
            'review_text' => null,
        ]);
    }

    /**
     * Create a positive review (4-5 stars).
     */
    public function positive(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(4, 5),
            'is_published' => true,
        ]);
    }

    /**
     * Create a negative review (1-2 stars).
     */
    public function negative(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(1, 2),
        ]);
    }
}
