<?php

namespace Database\Seeders;

use App\Models\ServiceActiveStatus;
use Illuminate\Database\Seeder;

class ServiceActiveStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Active',
                'description' => 'Service is active and available',
            ],
            [
                'name' => 'Inactive',
                'description' => 'Service is temporarily inactive',
            ],
            [
                'name' => 'Out of Stock',
                'description' => 'Service is currently out of stock',
            ],
            [
                'name' => 'Discontinued',
                'description' => 'Service has been permanently discontinued',
            ],
        ];

        foreach ($statuses as $status) {
            ServiceActiveStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
