<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\ChatConversation;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatConversation>
 */
class ChatConversationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = ChatConversation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'user_id' => User::factory(),
            'provider_id' => Provider::factory(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the conversation is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the conversation is inactive/archived.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a conversation with related booking, user, and provider.
     */
    public function withRelations(): static
    {
        $booking = Booking::factory()->create();

        return $this->state(fn (array $attributes) => [
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'provider_id' => $booking->provider_id,
        ]);
    }
}
