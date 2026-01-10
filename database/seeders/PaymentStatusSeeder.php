<?php

namespace Database\Seeders;

use App\Models\PaymentStatus;
use Illuminate\Database\Seeder;

class PaymentStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Pending',
                'description' => 'Payment is pending processing',
            ],
            [
                'name' => 'Completed',
                'description' => 'Payment has been completed successfully',
            ],
            [
                'name' => 'Failed',
                'description' => 'Payment processing failed',
            ],
            [
                'name' => 'Refunded',
                'description' => 'Payment has been refunded to the customer',
            ],
        ];

        foreach ($statuses as $status) {
            PaymentStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
