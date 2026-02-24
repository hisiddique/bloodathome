<?php

use App\Models\Provider;
use App\Models\ProviderStatus;
use App\Models\ProviderType;
use App\Models\User;
use Database\Seeders\ProviderStatusSeeder;
use Database\Seeders\ProviderTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(ProviderTypeSeeder::class);
    $this->seed(ProviderStatusSeeder::class);
});

function validProviderData(): array
{
    return [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
        'phone' => '07700900000',
        'password' => 'password',
        'password_confirmation' => 'password',
        'provider_type_id' => ProviderType::first()->id,
        'address_line1' => '123 Test Street',
        'address_line2' => null,
        'town_city' => 'London',
        'postcode' => 'SW1A 1AA',
        'experience_years' => 5,
        'bio' => 'Experienced phlebotomist.',
    ];
}

test('provider registration form can be rendered', function () {
    $response = $this->get(route('phlebotomist.register'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('auth/provider-register')
        ->has('providerTypes')
    );
});

test('provider types are passed to registration form', function () {
    $response = $this->get(route('phlebotomist.register'));

    $response->assertInertia(fn ($page) => $page
        ->has('providerTypes', ProviderType::count())
    );
});

test('provider can register with valid data', function () {
    $data = validProviderData();

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertRedirect(route('phlebotomist.register.complete'));

    $user = User::where('email', $data['email'])->first();
    expect($user)->not->toBeNull();
    expect($user->first_name)->toBe('Jane');
    expect($user->last_name)->toBe('Doe');
    expect($user->hasRole('provider'))->toBeTrue();

    $provider = Provider::where('user_id', $user->id)->first();
    expect($provider)->not->toBeNull();
    expect($provider->address_line1)->toBe('123 Test Street');
    expect($provider->town_city)->toBe('London');
    expect($provider->postcode)->toBe('SW1A 1AA');
});

test('provider is assigned pending status on registration', function () {
    $data = validProviderData();

    $this->post(route('phlebotomist.store'), $data);

    $user = User::where('email', $data['email'])->first();
    $provider = Provider::where('user_id', $user->id)->first();
    $pendingStatus = ProviderStatus::where('name', 'Pending')->first();

    expect($provider->status_id)->toBe($pendingStatus->id);
});

test('provider is logged in after registration', function () {
    $data = validProviderData();

    $this->post(route('phlebotomist.store'), $data);

    $this->assertAuthenticated();
});

test('provider is redirected to complete page after registration', function () {
    $data = validProviderData();

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertRedirect(route('phlebotomist.register.complete'));
});

test('registration complete page requires authentication', function () {
    $response = $this->get(route('phlebotomist.register.complete'));

    $response->assertRedirect(route('login'));
});

test('provider registration fails when email is already taken', function () {
    User::factory()->create(['email' => 'jane@example.com']);

    $data = validProviderData();

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('email');
});

test('provider registration fails without first name', function () {
    $data = validProviderData();
    unset($data['first_name']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('first_name');
});

test('provider registration fails without last name', function () {
    $data = validProviderData();
    unset($data['last_name']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('last_name');
});

test('provider registration fails without address', function () {
    $data = validProviderData();
    unset($data['address_line1']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('address_line1');
});

test('provider registration fails without town_city', function () {
    $data = validProviderData();
    unset($data['town_city']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('town_city');
});

test('provider registration fails without postcode', function () {
    $data = validProviderData();
    unset($data['postcode']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('postcode');
});

test('provider registration fails without provider_type_id', function () {
    $data = validProviderData();
    unset($data['provider_type_id']);

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('provider_type_id');
});

test('provider registration fails with invalid provider_type_id', function () {
    $data = validProviderData();
    $data['provider_type_id'] = 99999;

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('provider_type_id');
});

test('provider registration fails when passwords do not match', function () {
    $data = validProviderData();
    $data['password_confirmation'] = 'different_password';

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertSessionHasErrors('password');
});

test('experience_years is optional', function () {
    $data = validProviderData();
    $data['experience_years'] = null;

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertRedirect(route('phlebotomist.register.complete'));

    $user = User::where('email', $data['email'])->first();
    $provider = Provider::where('user_id', $user->id)->first();
    expect($provider->experience_years)->toBeNull();
});

test('address_line2 is optional', function () {
    $data = validProviderData();
    $data['address_line2'] = null;

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertRedirect(route('phlebotomist.register.complete'));
});

test('bio is optional', function () {
    $data = validProviderData();
    $data['bio'] = null;

    $response = $this->post(route('phlebotomist.store'), $data);

    $response->assertRedirect(route('phlebotomist.register.complete'));
});
