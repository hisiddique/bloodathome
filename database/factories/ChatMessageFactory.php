<?php

namespace Database\Factories;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = ChatMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $senderTypes = ['user', 'provider'];
        $senderType = fake()->randomElement($senderTypes);

        $messages = [
            'user' => [
                'Hi, I have a question about my upcoming appointment.',
                'What time will you arrive?',
                'Do I need to prepare anything before the blood test?',
                'Can you confirm the address?',
                'Is it possible to reschedule to another day?',
                'Thank you for your help!',
                'I have some allergies I need to mention.',
                'Will you need access to parking?',
            ],
            'provider' => [
                'Hello! I will be happy to help you.',
                'I will arrive at the scheduled time slot.',
                'Please ensure you are well hydrated before the test.',
                'I have confirmed the address from your booking.',
                'Yes, we can reschedule. What date works for you?',
                'You are welcome! See you soon.',
                'Please let me know about any allergies or medical conditions.',
                'Parking on the street is fine, thank you.',
            ],
        ];

        // Get conversation to extract user_id and provider_id
        $conversation = ChatConversation::factory();

        return [
            'conversation_id' => $conversation,
            'sender_type' => $senderType,
            'sender_id' => null, // Will be set based on sender_type in afterMaking
            'message' => fake()->randomElement($messages[$senderType]),
            'is_read' => fake()->boolean(70), // 70% chance of being read
            'read_at' => null,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (ChatMessage $message) {
            // Set sender_id based on sender_type
            if ($message->sender_type === 'user') {
                $message->sender_id = $message->conversation->user_id;
            } else {
                $message->sender_id = $message->conversation->provider_id;
            }
        });
    }

    /**
     * Indicate that the message is from a user/patient.
     */
    public function fromUser(): static
    {
        return $this->state(function (array $attributes) {
            $messages = [
                'Hi, I have a question about my upcoming appointment.',
                'What time will you arrive?',
                'Do I need to prepare anything before the blood test?',
                'Can you confirm the address?',
                'Is it possible to reschedule to another day?',
                'Thank you for your help!',
                'I have some allergies I need to mention.',
                'Will you need access to parking?',
            ];

            return [
                'sender_type' => 'user',
                'message' => fake()->randomElement($messages),
            ];
        });
    }

    /**
     * Indicate that the message is from a provider.
     */
    public function fromProvider(): static
    {
        return $this->state(function (array $attributes) {
            $messages = [
                'Hello! I will be happy to help you.',
                'I will arrive at the scheduled time slot.',
                'Please ensure you are well hydrated before the test.',
                'I have confirmed the address from your booking.',
                'Yes, we can reschedule. What date works for you?',
                'You are welcome! See you soon.',
                'Please let me know about any allergies or medical conditions.',
                'Parking on the street is fine, thank you.',
            ];

            return [
                'sender_type' => 'provider',
                'message' => fake()->randomElement($messages),
            ];
        });
    }

    /**
     * Indicate that the message has been read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the message is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Create a message with custom text.
     */
    public function withMessage(string $message): static
    {
        return $this->state(fn (array $attributes) => [
            'message' => $message,
        ]);
    }
}
