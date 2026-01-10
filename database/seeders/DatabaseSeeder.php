<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed lookup tables first (in dependency order)
        $this->call([
            // Status and type lookup tables
            BookingStatusSeeder::class,
            PaymentStatusSeeder::class,
            PaymentMethodSeeder::class,
            SettlementStatusSeeder::class,
            VerificationStatusSeeder::class,
            ProviderTypeSeeder::class,
            ServiceActiveStatusSeeder::class,
            ProviderStatusSeeder::class,
            CollectionTypeSeeder::class,
            ServiceCategorySeeder::class,

            // Roles and permissions
            RoleAndPermissionSeeder::class,
        ]);

        // Optionally create a test user
        // Uncomment if you want to create test data during seeding
        // User::factory(10)->create();
    }
}
