<?php

namespace Database\Seeders;

use App\Models\BookingStatus;
use Illuminate\Database\Seeder;

class BookingStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Pending',
                'description' => 'Booking has been created but not yet confirmed',
            ],
            [
                'name' => 'Confirmed',
                'description' => 'Booking has been confirmed by the provider',
            ],
            [
                'name' => 'Completed',
                'description' => 'Service has been completed successfully',
            ],
            [
                'name' => 'Cancelled',
                'description' => 'Booking has been cancelled',
            ],
        ];

        foreach ($statuses as $status) {
            BookingStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
