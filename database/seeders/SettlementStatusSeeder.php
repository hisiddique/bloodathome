<?php

namespace Database\Seeders;

use App\Models\SettlementStatus;
use Illuminate\Database\Seeder;

class SettlementStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Pending',
                'description' => 'Settlement is pending processing',
            ],
            [
                'name' => 'Processing',
                'description' => 'Settlement is currently being processed',
            ],
            [
                'name' => 'Paid',
                'description' => 'Settlement has been paid to the provider',
            ],
        ];

        foreach ($statuses as $status) {
            SettlementStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
