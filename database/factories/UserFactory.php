<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $middleName = fake()->optional(0.3)->firstName();
        $lastName = fake()->lastName();
        $fullName = $middleName
            ? "{$firstName} {$middleName} {$lastName}"
            : "{$firstName} {$lastName}";

        return [
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'full_name' => $fullName,
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->regexify('0[1-9][0-9]{9}'), // UK phone format
            'profile_image' => fake()->optional(0.4)->imageUrl(200, 200, 'people'),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model's email address should be verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Create a user configured as a patient (no provider profile).
     */
    public function asPatient(): static
    {
        return $this->state(fn (array $attributes) => [])
            ->afterCreating(function ($user) {
                $user->assignRole('patient');
            });
    }

    /**
     * Create a user configured as a provider (no patient profile).
     */
    public function asProvider(): static
    {
        return $this->state(fn (array $attributes) => [])
            ->afterCreating(function ($user) {
                $user->assignRole('provider');
            });
    }

    /**
     * Create a user configured as an admin.
     */
    public function asAdmin(): static
    {
        return $this->state(fn (array $attributes) => [])
            ->afterCreating(function ($user) {
                $user->assignRole('admin');
            });
    }

    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }
}
