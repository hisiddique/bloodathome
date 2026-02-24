<?php

use App\Models\Dependent;
use App\Models\Patient;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserPaymentMethod;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed([
        RoleAndPermissionSeeder::class,
    ]);
});

it('renders booking wizard for guests', function () {
    $this->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('book/index'));
});

it('passes null userData and empty arrays for guests', function () {
    $this->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->where('userData', null)
            ->where('userAddresses', [])
            ->where('userPaymentMethods', [])
            ->where('userDependents', [])
        );
});

it('passes user data for authenticated patients', function () {
    $user = User::factory()->asPatient()->create([
        'first_name' => 'Jane',
        'middle_name' => null,
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
        'phone' => '07700900000',
    ]);

    // Update the patient profile created by asPatient() with specific values
    $user->patient->update([
        'date_of_birth' => '1990-05-15',
        'nhs_number' => '123 456 7890',
    ]);

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->where('userData.name', 'Jane Doe')
            ->where('userData.email', 'jane@example.com')
            ->where('userData.phone', '07700900000')
            ->where('userData.date_of_birth', '1990-05-15')
            ->where('userData.nhs_number', '123 456 7890')
        );
});

it('passes null nhs_number when no patient profile', function () {
    $user = User::factory()->asPatient()->create();

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->where('userData.nhs_number', null)
        );
});

it('passes user addresses with correct structure', function () {
    $user = User::factory()->asPatient()->create();

    UserAddress::factory()->count(2)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->has('userAddresses', 2)
            ->has('userAddresses.0', fn (Assert $address) => $address
                ->hasAll(['id', 'label', 'address_line1', 'address_line2', 'town_city', 'postcode', 'is_default'])
            )
        );
});

it('filters out expired payment methods', function () {
    $user = User::factory()->asPatient()->create();

    UserPaymentMethod::factory()->create(['user_id' => $user->id]);
    UserPaymentMethod::factory()->expired()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->has('userPaymentMethods', 1)
        );
});

it('excludes sensitive payment method fields', function () {
    $user = User::factory()->asPatient()->create();

    UserPaymentMethod::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->has('userPaymentMethods', 1)
            ->has('userPaymentMethods.0', fn (Assert $method) => $method
                ->hasAll(['id', 'card_brand', 'card_last_four', 'card_exp_month', 'card_exp_year', 'is_default'])
                ->missing('stripe_payment_method_id')
                ->missing('stripe_customer_id')
            )
        );
});

it('passes dependents sorted newest first', function () {
    $user = User::factory()->asPatient()->create();

    $older = Dependent::factory()->create([
        'user_id' => $user->id,
        'first_name' => 'Alpha',
        'created_at' => now()->subDays(2),
    ]);

    $newer = Dependent::factory()->create([
        'user_id' => $user->id,
        'first_name' => 'Beta',
        'created_at' => now()->subDay(),
    ]);

    $this->actingAs($user)
        ->get(route('booking.wizard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('book/index')
            ->has('userDependents', 2)
            ->where('userDependents.0.first_name', 'Beta')
            ->where('userDependents.1.first_name', 'Alpha')
            ->has('userDependents.0', fn (Assert $dependent) => $dependent
                ->hasAll(['id', 'first_name', 'last_name', 'full_name', 'date_of_birth', 'relationship', 'nhs_number'])
            )
        );
});
