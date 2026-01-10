<?php

namespace Database\Seeders;

use App\Models\VerificationStatus;
use Illuminate\Database\Seeder;

class VerificationStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Pending',
                'description' => 'Verification is pending review',
            ],
            [
                'name' => 'Verified',
                'description' => 'Credential has been verified',
            ],
            [
                'name' => 'Rejected',
                'description' => 'Verification has been rejected',
            ],
            [
                'name' => 'Expired',
                'description' => 'Credential has expired',
            ],
        ];

        foreach ($statuses as $status) {
            VerificationStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
