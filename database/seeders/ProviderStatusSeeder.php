<?php

namespace Database\Seeders;

use App\Models\ProviderStatus;
use Illuminate\Database\Seeder;

class ProviderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Active',
                'description' => 'Provider is active and accepting bookings',
            ],
            [
                'name' => 'Inactive',
                'description' => 'Provider is inactive and not accepting bookings',
            ],
        ];

        foreach ($statuses as $status) {
            ProviderStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
