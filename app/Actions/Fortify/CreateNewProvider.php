<?php

namespace App\Actions\Fortify;

use App\Models\Provider;
use App\Models\ProviderStatus;
use App\Models\ProviderType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateNewProvider
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered provider.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'phone' => ['required', 'string', 'max:20'],
            'password' => $this->passwordRules(),
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'town_city' => ['required', 'string', 'max:100'],
            'postcode' => ['required', 'string', 'max:10'],
            'experience_years' => ['required', 'integer', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'provider_type_id' => ['required', 'exists:provider_types,id'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Create the user
            $user = User::create([
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'phone' => $input['phone'],
                'password' => $input['password'],
            ]);

            // Assign provider role
            $user->assignRole('provider');

            // Get the pending status
            $pendingStatus = ProviderStatus::where('name', 'Pending')->first();

            // Create the provider profile
            Provider::create([
                'user_id' => $user->id,
                'type_id' => $input['provider_type_id'],
                'status_id' => $pendingStatus->id,
                'address_line1' => $input['address_line1'],
                'address_line2' => $input['address_line2'] ?? null,
                'town_city' => $input['town_city'],
                'postcode' => $input['postcode'],
                'experience_years' => $input['experience_years'],
                'bio' => $input['bio'] ?? null,
            ]);

            return $user;
        });
    }

    /**
     * Get the provider types for registration form.
     *
     * @return array<int, array{id: int, name: string, description: string|null}>
     */
    public static function getProviderTypes(): array
    {
        return ProviderType::all(['id', 'name', 'description'])->toArray();
    }
}
